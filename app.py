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
    from models import Comment, db
    
    comment_text = request.form.get('comment', '').strip()
    
    if not comment_text:
        flash('Silakan masukkan komentar untuk dianalisis.', 'warning')
        return redirect(url_for('index'))
    
    # Create new comment record
    comment = Comment(
        content=comment_text,
        sentiment_result='Positif',  # Default for demo
        confidence_score=0.85,  # Mock confidence score
        ip_address=request.environ.get('REMOTE_ADDR'),
        user_agent=request.headers.get('User-Agent'),
        user_id=session.get('user_id')  # Will be None if not logged in
    )
    
    try:
        db.session.add(comment)
        db.session.commit()
        
        return render_template('index.html', 
                             comment=comment_text, 
                             sentiment_result='Positif',
                             show_result=True)
    except Exception as e:
        db.session.rollback()
        flash('Terjadi kesalahan saat menyimpan analisis.', 'error')
        return redirect(url_for('index'))

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
            return redirect(url_for('index'))
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
    """User dashboard showing their comment history"""
    from models import Comment
    
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    user_comments = Comment.query.filter_by(user_id=session['user_id']).order_by(Comment.created_at.desc()).limit(20).all()
    
    return render_template('index.html', user_comments=user_comments, show_dashboard=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
