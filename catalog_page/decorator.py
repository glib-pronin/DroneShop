import flask, flask_login
from functools import wraps

def admin_required(func):
    @wraps(func)
    def handler(*args, **kwargs):
        if not flask_login.current_user.is_authenticated or not flask_login.current_user.is_admin:
            return flask.jsonify({"success": False, "error": "rights_error"})
        else:
            return func(*args, **kwargs)
    return handler