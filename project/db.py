import flask_migrate, flask_sqlalchemy, os
from .settings import project
from sqlalchemy import select, and_
from sqlalchemy.orm import relationship

migration_path = os.path.abspath(__file__ + '/../migrations')

project.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///data.db'
DATABASE = flask_sqlalchemy.SQLAlchemy(app=project)
MIGRATE = flask_migrate.Migrate(app=project, db=DATABASE, directory=migration_path)

def migrate():
    if not os.path.exists(migration_path):
        os.system('flask db init')
    os.system('flask db migrate')
    os.system('flask db upgrade')