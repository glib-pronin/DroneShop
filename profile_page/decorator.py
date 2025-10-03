import flask, flask_login
from functools import wraps

def anonymous_required(func):
    @wraps(func)
    def handler(*args, **kwargs):
        if flask_login.current_user.is_authenticated:
            return flask.jsonify({"success": False, "error": "already_logged_in"})
        else:
            return func(*args, **kwargs)
    return handler