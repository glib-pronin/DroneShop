import flask_migrate, flask_sqlalchemy, os
from .settings import project

migration_path = os.path.abspath(__file__ + '/../migrations')

project.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///data.db'
DATABASE = flask_sqlalchemy.SQLAlchemy(app=project)
MIGRATE = flask_migrate.Migrate(app=project, db=DATABASE, directory=migration_path)