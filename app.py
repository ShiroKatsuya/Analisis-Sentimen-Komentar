import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime
from flask_migrate import Migrate
import requests
import pandas as pd
import io

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "mysql+pymysql://root@localhost/riyanah")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)
migrate = Migrate(app, db)

import command_migration.commands as commands  # Import custom CLI commands

# Create tables and import models
with app.app_context():
    import database_models.models as models  # noqa: F401
    db.create_all()

@app.route('/')
def index():
    """Main page showing the sentiment analysis interface"""
    return render_template('index.html')

def analyze_sentiment_with_api(text):
    """Send text to FastAPI for sentiment analysis and return (sentiment, confidence)."""
    fastapi_url = "http://127.0.0.1:8888/predict_sentiment/"
    try:
        response = requests.post(fastapi_url, json={"teks_baru": text})
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        sentiment = data.get("sentiment")
        confidence = data.get("confidence")
        print(f"Sentiment analysis result: {sentiment}, confidence: {confidence}")
        return sentiment, confidence
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to FastAPI: {e}")
        # Return default values in case of API error
        return "Tidak Diketahui", None
    
@app.route('/sentimen_admin')
def sentimen_admin():
    """Admin page showing the sentiment analysis data"""
    return render_template('data_latih.html')

 
      
        

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle comment submission and store in database"""
    from database_models.models import Comment, SentimentAnalysis, db
    
    comment_text = request.form.get('comment', '').strip()
    
    if not comment_text:
        flash('Silakan masukkan komentar untuk dianalisis.', 'warning')
        return redirect(url_for('index'))
    
    if len(comment_text) > 1000:
        flash('Komentar terlalu panjang. Maksimal 1000 karakter.', 'warning')
        return redirect(url_for('index'))
    
    # Perform sentiment analysis using FastAPI
    sentiment_result, confidence_score = analyze_sentiment_with_api(comment_text)
    
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
        
        flash(f'Analisis sentimen berhasil! Hasil: {sentiment_result}', 'success')
        
        return render_template('index.html', 
                             show_result=True, 
                             sentiment_result=sentiment_result, 
                             confidence_score=confidence_score,
                             comment=comment_text)
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving comment: {e}")
        flash('Terjadi kesalahan saat menyimpan hasil analisis.', 'error')
        return redirect(url_for('index'))

@app.route('/bulk_analyze', methods=['POST'])
def bulk_analyze():
    """Handle bulk CSV file upload and analysis"""
    from database_models.models import Comment, db
    
    try:
        # Check if file was uploaded
        if 'csv_file' not in request.files:
            flash('Tidak ada file yang diupload.', 'error')
            return redirect(url_for('index'))
        
        file = request.files['csv_file']
        
        # Check if file is selected
        if file.filename == '':
            flash('Tidak ada file yang dipilih.', 'error')
            return redirect(url_for('index'))
        
        # Check file extension
        if not file.filename.lower().endswith('.csv'):
            flash('Hanya file CSV yang diperbolehkan.', 'error')
            return redirect(url_for('index'))
        
        # Get form parameters
        comment_column = request.form.get('comment_column', '0')
        batch_size = int(request.form.get('batch_size', '100'))
        
        # Read CSV file
        try:
            # Read CSV content
            csv_content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_content))
            
            # Validate comment column
            try:
                comment_column_index = int(comment_column)
                if comment_column_index >= len(df.columns):
                    flash('Indeks kolom komentar tidak valid.', 'error')
                    return redirect(url_for('index'))
            except ValueError:
                flash('Indeks kolom komentar tidak valid.', 'error')
                return redirect(url_for('index'))
            
            # Get comments from the specified column
            comments = df.iloc[:, comment_column_index].dropna().astype(str).tolist()
            
            if not comments:
                flash('Tidak ada komentar yang ditemukan dalam file CSV.', 'error')
                return redirect(url_for('index'))
            
            # Limit comments to prevent abuse
            max_comments = 1000
            if len(comments) > max_comments:
                flash(f'File terlalu besar. Maksimal {max_comments} komentar yang dapat diproses.', 'warning')
                comments = comments[:max_comments]
            
            # Process comments in batches
            results = []
            total_processed = 0
            
            for i in range(0, len(comments), batch_size):
                batch = comments[i:i + batch_size]
                batch_results = []
                
                for comment_text in batch:
                    comment_text = comment_text.strip()
                    if len(comment_text) > 1000:
                        comment_text = comment_text[:1000]
                    
                    # Perform sentiment analysis
                    sentiment_result, confidence_score = analyze_sentiment_with_api(comment_text)
                    
                    # Store in database
                    comment = Comment(
                        content=comment_text,
                        sentiment_result=sentiment_result,
                        confidence_score=confidence_score,
                        ip_address=request.environ.get('REMOTE_ADDR'),
                        user_agent=request.headers.get('User-Agent'),
                        user_id=session.get('user_id')
                    )
                    
                    try:
                        db.session.add(comment)
                        batch_results.append({
                            'comment': comment_text,
                            'sentiment': sentiment_result,
                            'confidence': confidence_score,
                            'status': 'Berhasil'
                        })
                        total_processed += 1
                    except Exception as e:
                        print(f"Error saving comment: {e}")
                        batch_results.append({
                            'comment': comment_text,
                            'sentiment': 'Error',
                            'confidence': 0.0,
                            'status': 'Gagal'
                        })
                
                # Commit batch
                try:
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    print(f"Error committing batch: {e}")
                
                results.extend(batch_results)
            
            # Calculate summary statistics
            sentiment_counts = {}
            for result in results:
                sentiment = result['sentiment']
                sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            flash(f'Analisis bulk berhasil! {total_processed} komentar telah diproses.', 'success')
            
            # Store results in session for display
            session['bulk_results'] = results
            session['bulk_summary'] = {
                'total': len(results),
                'positive': sentiment_counts.get('Positif', 0),
                'negative': sentiment_counts.get('Negatif', 0),
                'unknown': sentiment_counts.get('Tidak Diketahui', 0)
            }
            
            return redirect(url_for('bulk_results'))
            
        except Exception as e:
            print(f"Error processing CSV: {e}")
            flash('Error saat memproses file CSV. Pastikan format file benar.', 'error')
            return redirect(url_for('index'))
            
    except Exception as e:
        print(f"Unexpected error in bulk_analyze: {e}")
        flash('Terjadi kesalahan yang tidak terduga.', 'error')
        return redirect(url_for('index'))

@app.route('/bulk_results')
def bulk_results():
    """Display bulk analysis results"""
    results = session.get('bulk_results', [])
    summary = session.get('bulk_summary', {})
    
    if not results:
        flash('Tidak ada hasil analisis bulk yang tersedia.', 'warning')
        return redirect(url_for('index'))
    
    return render_template('bulk_results.html', results=results, summary=summary)

def get_emotion_from_sentiment(sentiment):
    """Map sentiment to emotion"""
    emotion_map = {
        'Positif': 'joy',
        'Negatif': 'anger',
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
    from database_models.models import User, UserSession, db
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
    from database_models.models import User, db
    
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
    from database_models.models import UserSession, db
    
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

@app.route('/export-csv', methods=['POST'])
def export_csv():
    from database_models.models import Comment
    from flask import Response

    # Get selected comment IDs from the request body
    data = request.get_json()
    selected_comment_ids = data.get('comment_ids', [])

    if not selected_comment_ids:
        return jsonify({'error': 'Tidak ada komentar yang dipilih untuk diekspor.'}), 400

    # Fetch only selected comments
    comments = Comment.query.filter(Comment.id.in_(selected_comment_ids)).all()
    
    # Prepare data for CSV
    data = []
    for comment in comments:
        data.append({
            'Komentar': comment.content,
            'Label Prediksi': comment.sentiment_result,

  
        })
        
    df = pd.DataFrame(data)
    
    # Create a BytesIO object to save the CSV in-memory
    output = io.BytesIO()
    df.to_csv(output, index=False, encoding='utf-8')
    output.seek(0)
    
    # Send the CSV file as a response
    return Response(output.getvalue(), mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=hasil_klasifikasi.csv"})

@app.route('/dashboard')
def dashboard():
    """Dashboard page showing stats and recent comments"""
    from database_models.models import Comment, db # Moved import here for scope
    
    # Get total comments
    total_comments = Comment.query.count()
    
    # Get positive and negative comments
    positive_comments = Comment.query.filter_by(sentiment_result='Positif').count()
    negative_comments = Comment.query.filter_by(sentiment_result='Negatif').count()
    
    # Get latest user comments, limited to 4
    user_comments = Comment.query.order_by(Comment.created_at.desc()).limit(4).all()

    return render_template('dashboard.html',
                           total_comments=total_comments,
                           positive_comments=positive_comments,
                           negative_comments=negative_comments,
                           user_comments=user_comments)

@app.route('/data-latih')
def data_latih():
    """Data training page for sentiment analysis"""
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    from database_models.models import Comment_DataLatih, db # Import Comment model
    
    # Fetch all comments from the database
    comment_datalatihs = Comment_DataLatih.query.order_by(Comment_DataLatih.created_at.desc()).all()
    
    return render_template('data_latih.html', comment_datalatihs=comment_datalatihs)

@app.route('/upload_data_latih', methods=['POST'])
def upload_data_latih():
    """Handle CSV file upload for training data"""
    if 'user_id' not in session:
        return jsonify(success=False, message='Unauthorized. Please log in.'), 401
    
    if 'csv_file' not in request.files:
        return jsonify(success=False, message='No file part in the request.'), 400
    
    file = request.files['csv_file']
    
    if file.filename == '':
        return jsonify(success=False, message='No selected file.'), 400
        
    if file and file.filename.endswith('.csv'):
        try:
            # Read the CSV file into a pandas DataFrame
            df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
            
            # Check for required columns
            if 'komentar' not in df.columns or 'label' not in df.columns:
                return jsonify(success=False, message='CSV must contain "komentar" and "label" columns.'), 400
            
            from database_models.models import Comment_DataLatih, db # Import Comment model
            
            new_records_count = 0
            for index, row in df.iterrows():
                comment_content = str(row['komentar']).strip()
                sentiment_label = str(row['label']).strip()
                
                # Basic validation for sentiment labels
                if sentiment_label not in ['Positif', 'Negatif']:
                    flash(f'Label "{sentiment_label}" pada baris {index + 2} tidak valid. Hanya "Positif", "Negatif", yang diperbolehkan. Data ini akan diabaikan.', 'warning')
                    continue
                
                # Check if comment already exists to avoid duplicates
                existing_comment = Comment_DataLatih.query.filter_by(content=comment_content).first()
                if existing_comment:
                    flash(f'Komentar "{comment_content}" pada baris {index + 2} sudah ada dalam database. Data ini akan diabaikan.', 'info')
                    continue
                
                # Create a new Comment record
                new_comment = Comment_DataLatih(
                    content=comment_content,
                    sentiment_result=sentiment_label,
                    ip_address=request.environ.get('REMOTE_ADDR'), # Use a placeholder or actual IP
                    user_agent=request.headers.get('User-Agent'), # Use a placeholder or actual User-Agent
                    user_id=session.get('user_id'), # Assign to current user if logged in
                    created_at=datetime.utcnow() # Set current UTC time
                )
                db.session.add(new_comment)
                new_records_count += 1
            
            db.session.commit()
            flash(f'{new_records_count} data berhasil diimport!', 'success')
            return jsonify(success=True, message=f'{new_records_count} data berhasil diimport!')
            
        except Exception as e:
            db.session.rollback()
            return jsonify(success=False, message=f'Error processing CSV file: {str(e)}'), 500
    else:
        return jsonify(success=False, message='Invalid file type. Please upload a CSV file.'), 400

@app.route('/delete-comment/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """Handle deletion of a comment by ID"""
    if 'user_id' not in session:
        return jsonify(success=False, message='Unauthorized. Please log in.'), 401
    
    from database_models.models import Comment, SentimentAnalysis, db
    
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify(success=False, message='Komentar tidak ditemukan.'), 404

        # Ensure only the owner or an admin can delete (if admin role is implemented)
        # For now, allow logged-in users to delete their comments
        if comment.user_id != session.get('user_id'):
             # Allow deletion of comments with no user_id by any logged in user (e.g. uploaded data)
            if comment.user_id is not None:
                return jsonify(success=False, message='Anda tidak memiliki izin untuk menghapus komentar ini.'), 403

        # Delete associated sentiment analysis entry first due to foreign key constraint
        # Assuming one-to-one relationship
        SentimentAnalysis.query.filter_by(comment_id=comment.id).delete()
        
        db.session.delete(comment)
        db.session.commit()
        return jsonify(success=True, message='Komentar berhasil dihapus.')
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, message=f'Terjadi kesalahan saat menghapus komentar: {str(e)}'), 500

@app.route('/delete-comment-datalatih/<int:comment_id>', methods=['DELETE'])
def delete_comment_datalatih(comment_id):
    """Handle deletion of a comment by ID"""
    if 'user_id' not in session:
        return jsonify(success=False, message='Unauthorized. Please log in.'), 401
    
    from database_models.models import Comment_DataLatih, SentimentAnalysis, db
    
    try:
        comment = Comment_DataLatih.query.get(comment_id)
        if not comment:
            return jsonify(success=False, message='Komentar tidak ditemukan.'), 404

        # Ensure only the owner or an admin can delete (if admin role is implemented)
        # For now, allow logged-in users to delete their comments
        if comment.user_id != session.get('user_id'):
             # Allow deletion of comments with no user_id by any logged in user (e.g. uploaded data)
            if comment.user_id is not None:
                return jsonify(success=False, message='Anda tidak memiliki izin untuk menghapus komentar ini.'), 403

        # Delete associated sentiment analysis entry first due to foreign key constraint
        # Assuming one-to-one relationship
        SentimentAnalysis.query.filter_by(comment_id=comment.id).delete()
        
        db.session.delete(comment)
        db.session.commit()
        return jsonify(success=True, message='Komentar berhasil dihapus.')
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, message=f'Terjadi kesalahan saat menghapus komentar: {str(e)}'), 500

@app.route('/hasil-klasifikasi')
def hasil_klasifikasi():
    """Classification results page for sentiment analysis"""
    if 'user_id' not in session:
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('login'))
    
    from database_models.models import Comment, db
    
    # Base query: show both user's own comments and anonymous comments if user is logged in
    user_id = session.get('user_id')
    query = Comment.query.filter(
        (Comment.user_id == user_id) | (Comment.user_id == None)
    )

    # Optional sentiment filter via query parameter
    sentiment_filter = request.args.get('sentiment')
    if sentiment_filter in ('Positif', 'Negatif'):
        query = query.filter(Comment.sentiment_result == sentiment_filter)

    comments = query.order_by(Comment.created_at.desc()).all()
    
    # Calculate statistics
    total_comments = len(comments)
    positive_comments = len([c for c in comments if c.sentiment_result == 'Positif'])
    negative_comments = len([c for c in comments if c.sentiment_result == 'Negatif'])

    
    return render_template('hasil_klasifikasi.html',
                         comments=comments,
                         total_comments=total_comments,
                         positive_comments=positive_comments,
                         negative_comments=negative_comments,
                         )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)