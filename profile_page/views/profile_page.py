import flask, re
from flask_login import logout_user, current_user
from ..decorators import login_required
from ..models import Credentials, User, Destinations, DATABASE, select, and_
from order_page.views import get_city_names, api_key, _check_destination

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
def render_user_destinations():
    crd = current_user.credentials
    crd = crd[0] if crd else None
    destinations = crd.destinations if crd else None
    if flask.request.method == "POST":
        if not destinations:
            return flask.jsonify({"success": False, "error": "no credentials"})
        data = flask.request.get_json()
        dst_id = _safe_id(data.get("id"))
        if not dst_id:
            return flask.jsonify({"success": False, "error": "invalid id"})
        existing_dst = DATABASE.session.execute(select(Destinations).where(and_(
            Destinations.credentials_id == crd.id,
            Destinations.place == data.get("place"),
            Destinations.city == data.get("city")))).scalars().first()
        if existing_dst:
            return flask.jsonify({"success": False, "error": "existing destination"})
        if not _check_destination(data.get("city"), data.get("place")):
            return flask.jsonify({"success": False, "error": "invalid destination"})
        dst = DATABASE.session.get(Destinations, dst_id)
        if not dst:
            return flask.jsonify({"success": False, "error": "invalid id"})
        dst.city = data.get("city")
        dst.place = data.get("place")
        dst.type = 'parcel_locker' if 'Поштомат' in data.get("place") else 'department'
        DATABASE.session.commit()
        return flask.jsonify({"success": True, "header": f'{dst.city}, {dst.get_short_place()}', "new_city": dst.city, "new_place": dst.place})
    return flask.render_template('destinations.html', address_class='selected', destinations=destinations, cities=get_city_names(api_key))

def _safe_id(value):
    try:
        num = int(value)
        return num if num > 0 else None
    except (ValueError, TypeError):
        return None

@login_required
def choose_destination():
    data = flask.request.get_json()
    dest_id = _safe_id(data.get("destinationId"))
    crd = current_user.credentials
    crd_id = crd[0].id if crd else None
    if not crd_id or not dest_id:
        return flask.jsonify({"success": False, "error": "ID error"})
    chosen_dest = DATABASE.session.execute(select(Destinations).where(and_(
        Destinations.checked, 
        Destinations.credentials_id == crd_id))).scalars().first()
    new_dest = DATABASE.session.execute(select(Destinations).where(and_(
        Destinations.id == dest_id, 
        Destinations.credentials_id == crd_id))).scalars().first()
    if new_dest:
        new_dest.checked = True
        if chosen_dest:
            chosen_dest.checked = False
        DATABASE.session.commit()            
        return flask.jsonify({"success": True})
    return flask.jsonify({"success": False, "error": "ID error"})
    


@login_required
def logout():
    logout_user()
    return flask.redirect('/')
