from app import create_app, db
from app.models.models import User, Book, Rating, Review, Comment, UserBookList  # <- adjust path if necessary
from werkzeug.security import generate_password_hash


app = create_app()

with app.app_context():
    Comment.query.delete()
    Rating.query.delete()
    Review.query.delete()
    UserBookList.query.delete()
    Book.query.delete()
    User.query.delete()
    db.session.commit()
    print("Database cleared.")
  
    user = User(username='johndoe', email='johndoe@example.com', password_hash=generate_password_hash('plainpassword123'))
    book = Book(title='Running Up The Hill', author='Mike', genre='Motivational')
    admin = User(
        username='admin',
        email='admin@example.com',
        password_hash=generate_password_hash('secretpassword'),
        is_admin=True
    )
    db.session.add(admin)
    db.session.add(user)
    db.session.add(book)
    db.session.commit()
    print("Database seeded successfully.")
