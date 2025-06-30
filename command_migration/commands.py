from app import app, db
from database_models.models import User

@app.cli.command("seed_user")
def seed_user():
    """Adds a default user to the database."""
    username = "testuser"
    password = "testpass123"
    email = "testuser@gmail.com"

    if User.query.filter_by(username=username).first():
        print(f"User '{username}' already exists.")
    else:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"User '{username}' added successfully.") 