import flask_login, dotenv, os
from .settings import project
from profile_page import User

dotenv_path = os.path.abspath(__file__+'/../../.env')
project.secret_key = dotenv.get_key(dotenv_path=dotenv_path, key_to_get='SECRET_KEY')

LOGIN_MANAGER = flask_login.LoginManager(app=project)

@LOGIN_MANAGER.user_loader
def load_user(id: int):
    return User.query.get(id)