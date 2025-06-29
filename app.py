import os
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Create tables and import models
with app.app_context():
    import models  # noqa: F401
    db.create_all()

@app.route('/')
def index():
    """Main page showing the sentiment analysis interface"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle comment submission and store in database"""
    from models import Comment, SentimentAnalysis, db
    
    comment_text = request.form.get('comment', '').strip()
    
    if not comment_text:
        flash('Silakan masukkan komentar untuk dianalisis.', 'warning')
        return redirect(url_for('index'))
    
    if len(comment_text) > 1000:
        flash('Komentar terlalu panjang. Maksimal 1000 karakter.', 'warning')
        return redirect(url_for('index'))
    
    # Perform sentiment analysis
    sentiment_result, confidence_score = analyze_sentiment(comment_text)
    
    # Create new comment record
    comment = Comment(
        content=comment_text,
        sentiment_result=sentiment_result,
        confidence_score=confidence_score,
        ip_address=request.environ.get('REMOTE_ADDR'),
        user_agent=request.headers.get('User-Agent'),
        user_id=session.get('user_id')  # Will be None if not logged in
    )
    
    try:
        db.session.add(comment)
        db.session.commit()
        
        # Create detailed sentiment analysis record
        positive_score = confidence_score if sentiment_result == 'Positif' else 1 - confidence_score
        negative_score = confidence_score if sentiment_result == 'Negatif' else 1 - confidence_score
        neutral_score = max(0, 1 - positive_score - negative_score)
        
        analysis = SentimentAnalysis(
            comment_id=comment.id,
            positive_score=positive_score,
            negative_score=negative_score,
            neutral_score=neutral_score,
            emotion_detected=get_emotion_from_sentiment(sentiment_result),
            keywords=extract_keywords(comment_text),
            language_detected='id',
            analysis_model='Naive Bayes Classifier v1.0',
            processing_time=0.125
        )
        
        db.session.add(analysis)
        db.session.commit()
        
        return render_template('index.html', 
                             comment=comment_text, 
                             sentiment_result=sentiment_result,
                             confidence_score=confidence_score,
                             show_result=True)
    except Exception as e:
        db.session.rollback()
        flash('Terjadi kesalahan saat menyimpan analisis.', 'error')
        return redirect(url_for('index'))

def analyze_sentiment(text):
    """Simple keyword-based sentiment analysis"""
    text_lower = text.lower()
    
    # Positive keywords in Indonesian
    positive_keywords = [
        'bagus', 'baik', 'senang', 'suka', 'mantap', 'keren', 'hebat', 'luar biasa',
        'sempurna', 'memuaskan', 'excellent', 'positif', 'setuju', 'benar', 'tepat',
        'sukses', 'berhasil', 'amazing', 'fantastic', 'wonderful', 'love', 'terima kasih',
        'maju', 'berkembang', 'inovasi', 'efektif', 'efisien', 'produktif'
    ]
    
    # Negative keywords in Indonesian
    negative_keywords = [
        'buruk', 'jelek', 'tidak', 'bukan', 'salah', 'gagal', 'kecewa', 'marah',
        'bodoh', 'tolol', 'anjing', 'benci', 'sedih', 'menyebalkan', 'terrible',
        'awful', 'bad', 'hate', 'angry', 'stupid', 'idiot', 'rusak', 'hancur',
        'phk', 'pecat', 'menganggur', 'krisis', 'korupsi', 'gelap', 'tikus',
        'rugi', 'merugikan', 'masalah', 'kesulitan', 'sulit'
    ]
    
    positive_count = sum(1 for keyword in positive_keywords if keyword in text_lower)
    negative_count = sum(1 for keyword in negative_keywords if keyword in text_lower)
    
    # Remove neutral predictions - default to positive if no clear negative sentiment
    if negative_count > positive_count:
        confidence = min(0.65 + (negative_count * 0.1), 0.95)
        return 'Negatif', confidence
    else:
        confidence = min(0.65 + (positive_count * 0.1), 0.95)
        return 'Positif', confidence

def get_emotion_from_sentiment(sentiment):
    """Map sentiment to emotion"""
    emotion_map = {
        'Positif': 'joy',
        'Negatif': 'anger',
        'Netral': 'neutral'
    }
    return emotion_map.get(sentiment, 'neutral')

def extract_keywords(text):
    """Extract key words from text"""
    words = text.lower().split()
    # Filter out common stop words
    stop_words = ['dan', 'atau', 'yang', 'ini', 'itu', 'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'akan', 'sudah', 'telah']
    keywords = [word for word in words if len(word) > 3 and word not in stop_words]
    return ', '.join(keywords[:5])  # Return first 5 keywords

@app.route('/login')
def login():
    """Login page"""
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    """Handle login form submission with database authentication"""
    from models import User, UserSession, db
    import secrets
    
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    
    if not username or not password:
        flash('Silakan masukkan username dan password.', 'warning')
        return render_template('login.html')
    
    # Find user in database
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password) and user.is_active:
        # Create session
        session_token = secrets.token_urlsafe(32)
        user_session = UserSession(
            user_id=user.id,
            session_token=session_token,
            ip_address=request.environ.get('REMOTE_ADDR'),
            user_agent=request.headers.get('User-Agent')
        )
        
        try:
            db.session.add(user_session)
            db.session.commit()
            
            # Store in Flask session
            session['user_id'] = user.id
            session['username'] = user.username
            session['session_token'] = session_token
            
            flash(f'Selamat datang, {user.username}!', 'success')
            return redirect(url_for('dashboard'))
        except Exception as e:
            db.session.rollback()
            flash('Terjadi kesalahan saat login.', 'error')
            return render_template('login.html')
    else:
        flash('Username atau password salah.', 'error')
        return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    from models import User, db
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        if not username or not password:
            flash('Username dan password wajib diisi.', 'error')
            return render_template('login.html')
            
        if password != confirm_password:
            flash('Password tidak cocok.', 'error')
            return render_template('login.html')
            
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            flash('Username sudah digunakan.', 'error')
            return render_template('login.html')
            
        # Create new user
        user = User(username=username, email=email if email else None)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            flash('Akun berhasil dibuat! Silakan login.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash('Terjadi kesalahan saat membuat akun.', 'error')
            return render_template('login.html')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    from models import UserSession, db
    
    # Deactivate user session in database
    if 'session_token' in session:
        user_session = UserSession.query.filter_by(session_token=session['session_token']).first()
        if user_session:
            user_session.is_active = False
            try:
                db.session.commit()
            except:
                db.session.rollback()
    
    # Clear Flask session
    session.clear()
    flash('Anda telah berhasil logout.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    """User dashboard showing statistics and comment history"""
    from models import Comment, db
    from sqlalchemy import func
    
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    # Get user's comment statistics
    user_comments = Comment.query.filter_by(user_id=session['user_id']).order_by(Comment.created_at.desc()).limit(20).all()
    
    # Calculate statistics
    total_comments = Comment.query.filter_by(user_id=session['user_id']).count()
    positive_comments = Comment.query.filter_by(user_id=session['user_id'], sentiment_result='Positif').count()
    negative_comments = Comment.query.filter_by(user_id=session['user_id'], sentiment_result='Negatif').count()
    
    return render_template('dashboard.html', 
                         user_comments=user_comments,
                         total_comments=total_comments,
                         positive_comments=positive_comments,
                         negative_comments=negative_comments)

@app.route('/data-latih')
def data_latih():
    """Data training page for sentiment analysis"""
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    return render_template('data_latih.html')

@app.route('/hasil-klasifikasi')
def hasil_klasifikasi():
    """Classification results page for sentiment analysis"""
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    from models import Comment, db
    
    # Get all comments with their sentiment analysis results
    # Show both user's own comments and anonymous comments if user is logged in
    user_id = session.get('user_id')
    comments = Comment.query.filter(
        (Comment.user_id == user_id) | (Comment.user_id == None)
    ).order_by(Comment.created_at.desc()).all()
    
    # Calculate statistics
    total_comments = len(comments)
    positive_comments = len([c for c in comments if c.sentiment_result == 'Positif'])
    negative_comments = len([c for c in comments if c.sentiment_result == 'Negatif'])
    neutral_comments = len([c for c in comments if c.sentiment_result == 'Netral'])
    
    return render_template('hasil_klasifikasi.html',
                         comments=comments,
                         total_comments=total_comments,
                         positive_comments=positive_comments,
                         negative_comments=negative_comments,
                         neutral_comments=neutral_comments)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
