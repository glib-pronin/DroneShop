from flask_mail import Mail, Message
from .settings import project
import dotenv, os

env_path = os.path.abspath(__file__+'/../../.env')

project.config['MAIL_SERVER'] = 'smtp.gmail.com'
project.config['MAIL_PORT'] = 587
project.config['MAIL_USE_TLS'] = True
project.config['MAIL_USERNAME'] = dotenv.get_key(env_path, 'EMAIL')
project.config['MAIL_PASSWORD'] = dotenv.get_key(env_path, 'PASSWORD')
project.config['MAIL_DEFAULT_SENDER'] = ("DroneShop", dotenv.get_key(env_path, 'EMAIL'))

MAIL_MANAGER = Mail(app=project)