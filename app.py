import os
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_development")

@app.route('/')
def index():
    """Main page showing the sentiment analysis interface"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle comment submission and show mock results"""
    comment = request.form.get('comment', '').strip()
    
    if not comment:
        flash('Silakan masukkan komentar untuk dianalisis.', 'warning')
        return redirect(url_for('index'))
    
    # For this frontend-only implementation, we'll always return positive sentiment
    # In a real implementation, this would call a sentiment analysis service
    sentiment_result = 'Positif'
    
    return render_template('index.html', 
                         comment=comment, 
                         sentiment_result=sentiment_result,
                         show_result=True)

@app.route('/login')
def login():
    """Login page"""
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    """Handle login form submission (frontend only)"""
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()
    
    if not username or not password:
        flash('Silakan masukkan username dan password.', 'warning')
        return render_template('login.html')
    
    # For frontend demo - show success message and redirect
    flash('Login berhasil! (Demo mode)', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
