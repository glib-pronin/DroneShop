import flask, re, requests
from project.load_env import bot_token, admin_chat_id

url = f'https://api.telegram.org/bot{bot_token}/sendMessage'

def render_contacts_page():
    return flask.render_template('contacts_page.html')

def _send_message_to_admin(data): 
    req_body = {
        "chat_id": admin_chat_id,
        "text": f"""Нове повідомлення.
Ім'я: {data.get("name")}
Мобільний телефон: {data.get("phone_number")}
Електрона пошта: {data.get("email")}
Повідомлення: {data.get("message")}""" 
    }
    res = requests.post(url=url, data=req_body)
    if res.status_code == 200:
        return True
    return False


def send_message():
    req_data = flask.request.get_json().get("data")
    for key, value in req_data.items():
        if value.strip() == '':
            return flask.jsonify({"success": False, "message": f"Field {key} is required"})
    if not re.match(r'^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', req_data.get("email")):
        return flask.jsonify({"success": False, "message": "Invalid email"})
    if not re.match(r'^\+38\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$', req_data.get("phone_number")):
        return flask.jsonify({"success": False, "message": "Invalid phine_number"})
    if _send_message_to_admin(req_data):
        return flask.jsonify({"success": True})    
    return flask.jsonify({"success": False, "message": "Error during sending"})
