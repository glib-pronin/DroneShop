import flask
from ..decorator import admin_required
from ..models import Section, DATABASE

@admin_required
def add_statistic():
    data = flask.request.get_json()
    section = DATABASE.session.get(Section, int(data.get("id")))
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    if section.position != "center":
        return flask.jsonify({"success": False, "error": "can`t add statistic to this section"})
    section.statistic_string = data.get("statistic")
    DATABASE.session.commit()
    return flask.jsonify({"success": True, "statistic": section.statistic_string})

@admin_required
def get_statistic(section_id):
    section = DATABASE.session.get(Section, section_id)
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    return flask.jsonify({"success": True, "statistic": section.statistic_string})

@admin_required
def update_statistic():
    data = flask.request.get_json()
    section = DATABASE.session.get(Section, int(data.get("id")))
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    section.statistic_string = data.get("statistic")
    DATABASE.session.commit()
    return flask.jsonify({"success": True, "statistic": section.statistic_string})

@admin_required
def delete_statistic():
    data = flask.request.get_json()
    section = DATABASE.session.get(Section, int(data.get("id")))
    if not section:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    section.statistic_string = None
    DATABASE.session.commit()
    return flask.jsonify({"success": True})