from flask_mail import Mail, Message
from .settings import project
from .load_env import email, password

project.config['MAIL_SERVER'] = 'smtp.gmail.com'
project.config['MAIL_PORT'] = 587
project.config['MAIL_USE_TLS'] = True
project.config['MAIL_USERNAME'] = email
project.config['MAIL_PASSWORD'] = password
project.config['MAIL_DEFAULT_SENDER'] = ("DroneShop", email)

MAIL_MANAGER = Mail(app=project)