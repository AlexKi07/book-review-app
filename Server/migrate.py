from flask_migrate import MigrateCommand
from flask_script import Manager
from app import create_app
from app.extensions import db

app = create_app()
manager = Manager(app)

# Add the db command for migrations
from flask_migrate import Migrate
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()
