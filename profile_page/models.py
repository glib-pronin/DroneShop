import flask_login
from project.db import DATABASE, select

class User(DATABASE.Model, flask_login.UserMixin):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    name = DATABASE.Column(DATABASE.String, nullable=False)
    email = DATABASE.Column(DATABASE.String, nullable=False)
    password = DATABASE.Column(DATABASE.String, nullable=False)