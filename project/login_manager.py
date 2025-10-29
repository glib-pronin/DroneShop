import flask_login
from .settings import project
from .load_env import seckret_key
from profile_page import User

project.secret_key = seckret_key

LOGIN_MANAGER = flask_login.LoginManager(app=project)

@LOGIN_MANAGER.user_loader
def load_user(id: int):
    return User.query.get(id)