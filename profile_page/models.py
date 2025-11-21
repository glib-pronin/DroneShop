import flask_login, re
from project.db import DATABASE, select, relationship, and_

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
    orders = relationship('Order', back_populates='credentials', cascade="all, delete-orphan")
    destinations = relationship('Destinations', back_populates='credentials', cascade="all, delete-orphan")

class Destinations(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    city = DATABASE.Column(DATABASE.String)
    type = DATABASE.Column(DATABASE.String)
    place = DATABASE.Column(DATABASE.String)
    checked = DATABASE.Column(DATABASE.Boolean, default=False)
    credentials_id = DATABASE.Column(DATABASE.Integer, DATABASE.ForeignKey('credentials.id', name='fk_destinations_credentials_id'))

    credentials = relationship('Credentials', back_populates='destinations')

    def get_short_place(self):
        parts = self.place.split(':')
        parts[1] = re.sub(r'\s\(.*\)', '', parts[1])
        return ':'.join(parts)