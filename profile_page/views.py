import flask
from flask_login import login_user, logout_user
from .models import User, DATABASE, select
from werkzeug.security import generate_password_hash, check_password_hash

def register():
    data = flask.request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")

    if len(password) < 6:
         return flask.jsonify({"success": False, "error": "weak_password"})
    if password != confirmPassword:
         return flask.jsonify({"success": False, "error": "diff_password"})
    existing = DATABASE.session.execute(select(User).where(User.email == email)).scalars().first()
    if existing:
        return flask.jsonify({"success": False, "error": "existing_email"})
    
    user = User(name=name, email=email, password=generate_password_hash(password))
    DATABASE.session.add(user)
    DATABASE.session.commit()
    login_user(user)
    return flask.jsonify({"success": True})

def login():
    data = flask.request.get_json()
    email = data.get("email")
    password = data.get("password")

    user =  DATABASE.session.execute(select(User).where(User.email == email)).scalars().first()
    if not user or not check_password_hash(user.password, password):
        return flask.jsonify({"success": False, "error": "invalid_credentials"})
    login_user(user)
    return flask.jsonify({"success": True})