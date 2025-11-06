import flask, re
from flask_login import logout_user, current_user
from ..decorators import login_required
from ..models import Credentials, User, DATABASE, select

@login_required
def render_credentials():
    crd = current_user.credentials
    crd = crd[0] if crd else None
    if flask.request.method == 'POST':
        fields = ["second_name", "first_name", "father_name", "phone_number"]
        email_data = flask.request.form.get("email")
        birth_date = flask.request.form.get("birth_date")
        change_birth_date = True
        change_email = True

        if birth_date and not re.match(r'^\d{4}-\d{2}-\d{2}$', birth_date):
            change_birth_date = False
        if not email_data or not re.match(r'^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email_data):
            change_email = False
        if current_user.email != email_data:
            existing_user = DATABASE.session.execute(select(User).where(User.email == email_data)).scalars().first()
            if existing_user:
                change_email = False
            else:
                current_user.email = email_data
        if crd:
            fields.append("birth_date") if change_birth_date else None
            fields.append("email") if change_email else None
            for field in fields:
                setattr(crd, field, flask.request.form.get(field))
        else:
            current_user.credentials.append(Credentials(
            second_name = flask.request.form["second_name"],
            first_name = flask.request.form["first_name"],
            father_name = flask.request.form["father_name"],
            birth_date = birth_date if change_birth_date else None,
            phone_number = flask.request.form["phone_number"],
            email = email_data if change_email else None
            ))
        DATABASE.session.commit()
        return flask.redirect('/credentials')
    return flask.render_template('credentials.html', credentials_class='selected', crd=crd)

@login_required
def logout():
    logout_user()
    return flask.redirect('/')
