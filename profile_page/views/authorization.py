import flask, random, re
from flask_login import login_user, logout_user
from ..models import User, DATABASE, select, Credentials
from werkzeug.security import generate_password_hash, check_password_hash
from ..decorators import anonymous_required
from project.mail_manager import MAIL_MANAGER, Message

def _bind_user_with_credentials(user_id, user_email):
    crd = DATABASE.session.execute(select(Credentials).where(Credentials.email == user_email)).scalar_one_or_none()
    if crd and crd.user_id is None:
        crd.user_id = user_id
        DATABASE.session.commit()

@anonymous_required
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
    if not re.match(r'^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return flask.jsonify({"success": False, "error": "invalid_email"})
    existing = DATABASE.session.execute(select(User).where(User.email == email)).scalars().first()
    if existing:
        return flask.jsonify({"success": False, "error": "existing_email"})
    
    user = User(name=name, email=email, password=generate_password_hash(password))
    DATABASE.session.add(user)
    DATABASE.session.commit()
    login_user(user)
    _bind_user_with_credentials(user.id, user.email)
    return flask.jsonify({"success": True})

@anonymous_required
def login():
    data = flask.request.get_json()
    email = data.get("email")
    password = data.get("password")
    user =  DATABASE.session.execute(select(User).where(User.email == email)).scalars().first()
    if not user or not check_password_hash(user.password, password):
        return flask.jsonify({"success": False, "error": "invalid_credentials"})
    login_user(user)
    _bind_user_with_credentials(user.id, user.email)
    return flask.jsonify({"success": True})

@anonymous_required
def send_code():
    data = flask.request.get_json()
    email = data.get("email")
    user = DATABASE.session.execute(select(User).where(User.email == email)).scalars().first()
    if not user:
        return flask.jsonify({"success": False, "error": "invalid_credentials"})
    code = random.randint(100000, 999999)
    flask.session["reset_code"] = f"{code}"
    flask.session["reset_id"] = user.id
    try:
        msg = Message(subject='Відновлення паролю', recipients=[user.email])
        msg.body = f"""
        Ваш код для відновлення паролю: {code}
        
        Якщо ви не робили запит на зміну паролю — просто проігноруйте цей лист.
        """
        MAIL_MANAGER.send(msg)
    except Exception:
        return flask.jsonify({"success": False, "error": "email_not_sent"})
    return flask.jsonify({"success": True})

@anonymous_required
def verify_code():
    data = flask.request.get_json()
    code_from_user = data.get("code")
    reset_code = flask.session.get('reset_code')
    print(reset_code)
    if reset_code != code_from_user:
        return flask.jsonify({"success": False, "error": "invalid_code"})
    flask.session.pop('reset_code')
    return flask.jsonify({"success": True})

@anonymous_required
def reset_password():
    data = flask.request.get_json()
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")
    id = flask.session.get("reset_id")

    if not id:
         return flask.jsonify({"success": False, "error": "no_session"})
    if len(password) < 6:
        return flask.jsonify({"success": False, "error": "weak_password"})
    if password != confirmPassword:
        return flask.jsonify({"success": False, "error": "diff_password"})
    user = DATABASE.session.get(User, id)
    if not user:
        return flask.jsonify({"success": False, "error": "no_session"})
    user.password = generate_password_hash(password)
    DATABASE.session.commit()
    flask.session.pop("reset_id")
    return flask.jsonify({"success": True})