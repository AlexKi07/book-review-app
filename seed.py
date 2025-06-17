from app import create_app, db
from app.models.models import User, Book, Rating, Review, Comment, UserBookList  # <- adjust path if necessary

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
  
    user = User(username='johndoe', email='johndoe@example.com', password_hash='hashed')
    book = Book(title='Flask Guide', author='ChatGPT', genre='Tech')

    db.session.add(user)
    db.session.add(book)
    db.session.commit()
    print("Database seeded successfully.")
