# WELCOME TO REVIEWCORNER (A Book Review App)

This app is designed to enable users who enjoy reading to gain insights into trendy books, their reviews, and also allow them to post their recommendations.

Live Frontend: (https://book-review-app-psi.vercel.app)  
Live Backend API: (https://book-review-app-kgew.onrender.com)
Live Database: (postgresql://br_db_user:y05C1UCEXj5nD5rsxGHbXcFXorBXAqiq@dpg-d1f795adbo4c739mh5tg-a.oregon-postgres.render.com/br_db)


## User Stories

- As a **visitor**, I can register and log in.

- As a **user**, I can:
  - View all books
  - Search books by title or genre
  - See book details and reviews
  - Post, edit, or delete my reviews
  - Rate books and comment on other reviews
  - Update my profile picture and bio
  - Add books to "Want to Read", "Reading", or "Read" lists

- As an **admin**, I can:
  - View all users and moderate content
  - Ban/unban users
  - Add, edit, or delete books

---

## Tech Stack

1. Frontend = React, Vite, Tailwind CSS 
2. Backend = Flask, Flask-JWT-Extended, SQLAlchemy 
3. Database = PostgreSQL 
4. Auth = JWT 
5. Deployment = Vercel (frontend), Render (backend) 

## How To Initialise
1. Clone the Repository

   git clone https://github.com/AlexKi07/book-review-app.git
    cd book-review-app

3. Set up Backend

    cd Server
    pipenv install
    pipenv shell

3. Database
    
    flask db upgrade     
    python seed.py        
    flask run 

4. Set upthe  frontend
    
    cd Client
    npm install
    -Create .env file
    VITE_API_URL=http://localhost:5000
    npm run dev

5. App is ready. Enjoy!!
      Visit: http://localhost:5173
      Backend API: http://localhost:5000


Copyright©
2025 ReviewCorner. All rights reserved.


