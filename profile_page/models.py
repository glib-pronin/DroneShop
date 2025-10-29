import flask_login
from project.db import DATABASE, select, relationship

class User(DATABASE.Model, flask_login.UserMixin):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    name = DATABASE.Column(DATABASE.String, nullable=False)
    email = DATABASE.Column(DATABASE.String, nullable=False)
    password = DATABASE.Column(DATABASE.String, nullable=False)

    credentials = relationship('Credentials', back_populates='user')


class Credentials(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    second_name = DATABASE.Column(DATABASE.String)
    first_name = DATABASE.Column(DATABASE.String)
    father_name = DATABASE.Column(DATABASE.String)
    birth_date = DATABASE.Column(DATABASE.String)
    phone_number = DATABASE.Column(DATABASE.String)
    email = DATABASE.Column(DATABASE.String)
    user_id = DATABASE.Column(DATABASE.Integer, DATABASE.ForeignKey('user.id'))

    user = relationship('User', back_populates='credentials')
    orders = relationship('Order', back_populates='credentials')