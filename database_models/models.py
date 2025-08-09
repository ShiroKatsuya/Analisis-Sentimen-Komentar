from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """User model for storing user account information"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship with comments
    comments = db.relationship('Comment', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set the password for the user"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'


class Comment(db.Model):
    """Comment model for storing user comments and sentiment analysis results"""
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    sentiment_result = db.Column(db.String(20), nullable=True)  # 'Positif', 'Negatif'
    confidence_score = db.Column(db.Float, nullable=True)  # Confidence level (0.0 to 1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key relationship with User
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Additional metadata
    ip_address = db.Column(db.String(45), nullable=True)  # For anonymous users
    user_agent = db.Column(db.String(500), nullable=True)
    
    def __repr__(self):
        return f'<Comment {self.id}: {self.content[:50]}...>'

class Comment_DataLatih(db.Model):
    """Comment model for storing user comments and sentiment analysis results"""
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    sentiment_result = db.Column(db.String(20), nullable=True)  # 'Positif', 'Negatif'
    # confidence_score = db.Column(db.Float, nullable=True)  # Confidence level (0.0 to 1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key relationship with User
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Additional metadata
    ip_address = db.Column(db.String(45), nullable=True)  # For anonymous users
    user_agent = db.Column(db.String(500), nullable=True)
    
    def __repr__(self):
        return f'<Comment_DataLatih {self.id}: {self.content[:50]}...>'

class SentimentAnalysis(db.Model):
    """Model for storing detailed sentiment analysis metrics"""
    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=False, unique=True)
    
    # # Sentiment scores for different categories
    # positive_score = db.Column(db.Float, nullable=True)
    # negative_score = db.Column(db.Float, nullable=True)
    # neutral_score = db.Column(db.Float, nullable=True)
    
    # Additional analysis metrics
    emotion_detected = db.Column(db.String(50), nullable=True)  # joy, anger, fear, etc.
    keywords = db.Column(db.Text, nullable=True)  # JSON string of detected keywords
    language_detected = db.Column(db.String(10), nullable=True)  # 'id', 'en', etc.
    
    # Processing metadata
    analysis_model = db.Column(db.String(100), nullable=True)  # Model used for analysis
    processing_time = db.Column(db.Float, nullable=True)  # Time taken in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    comment = db.relationship('Comment', backref=db.backref('analysis', uselist=False))
    
    def __repr__(self):
        return f'<SentimentAnalysis for Comment {self.comment_id}>'


class UserSession(db.Model):
    """Model for tracking user sessions and activity"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    session_token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship
    user = db.relationship('User', backref='sessions')
    
    def __repr__(self):
        return f'<UserSession {self.session_token[:8]}... for User {self.user_id}>'