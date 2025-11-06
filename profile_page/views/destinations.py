import flask
from flask_login import current_user
from ..decorators import login_required
from ..models import Destinations, DATABASE, select, and_
from order_page.views import get_city_names, api_key, _check_destination

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
    