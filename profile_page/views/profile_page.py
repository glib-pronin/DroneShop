import flask, re
from flask_login import logout_user, current_user
from ..decorators import login_required
from ..models import Credentials, DATABASE

@login_required
def render_credentials():
    crd = current_user.credentials
    crd = crd[0] if crd else None
    if flask.request.method == 'POST':
        email_data = flask.request.form.get("email")
        if email_data and not re.match(r'^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email_data):
            return flask.redirect('/credentials')
        if crd:
            for field in ["second_name", "first_name", "father_name", "birth_date", "phone_number", "email"]:
                setattr(crd, field, flask.request.form.get(field))
        else:
            current_user.credentials.append(Credentials(
            second_name = flask.request.form["second_name"],
            first_name = flask.request.form["first_name"],
            father_name = flask.request.form["father_name"],
            birth_date = flask.request.form["birth_date"],
            phone_number = flask.request.form["phone_number"],
            email = flask.request.form["email"]
            ))
        DATABASE.session.commit()
        return flask.redirect('/credentials')
    return flask.render_template('credentials.html', credentials_class='selected', crd=crd)

@login_required
def logout():
    logout_user()
    return flask.redirect('/')