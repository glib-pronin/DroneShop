import flask, requests, re
from datetime import datetime
from flask_login import current_user
from catalog_page.models import Product, DATABASE
from profile_page.models import Credentials, Destinations, select, and_
from catalog_page.views.cart import _get_cart_ids
from flask_login import current_user
from project.load_env import api_key, mono_api_key, liq_private, liq_public, admin_chat_id, bot_token
from project.mail_manager import MAIL_MANAGER, Message
from .models import Order
from liqpay import LiqPay

url = 'https://api.novaposhta.ua/v2.0/json/'
tg_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
mono_url= 'https://api.monobank.ua/api/merchant/invoice/create'
from_cart = None

def redirect_payment(amount, from_cart):
    data = {
        "amount": amount,
        "ccy": 980,
        "redirectUrl": f"http://127.0.0.1:5000/success?from_cart={from_cart}&paied_now=1"
    }
    resp = requests.post(url=mono_url, json=data, headers={"X-Token": mono_api_key})
    if resp.status_code == 200:
        return resp.json().get("pageUrl")
    return '/error_payment'

def create_liqpay(amount, order_id):
    liqpay = LiqPay(liq_public, liq_private)
    html = liqpay.cnb_form({
        'action': 'pay',
        'amount': amount,
        'currency': 'UAH',
        'description': 'Оплата товарів на сайт "Drones"',
        'order_id': order_id,
        'version': '3',
        'sandbox': 1,  
        'server_url': 'https://glibpronin.pythonanywhere.com/validate_liqpay',
        'result_url': 'https://glibpronin.pythonanywhere.com/liqpay_result'
    })
    return html

def get_city_names(api_key):
    data = {
        "apiKey": api_key,
        "modelName": "Address",
        "calledMethod": "getCities",
        "methodProperties": {}
    }
    city_names = []
    city_in_area = []
    try:
        resp = requests.post(url, json=data, timeout=10)
    except:
        return []
    for c in resp.json().get('data'):
        name = c.get('Description')
        if 'обл' in name or 'р-н' in name:
            city_in_area.append(name)
        else:
            city_names.append(name)
    return city_names + city_in_area

def get_departments():
    city_name = flask.request.json.get('city_name')
    dep_type = flask.request.json.get('type')
    data = {
            "apiKey": api_key,
            "modelName": "Address",
            "calledMethod": "getWarehouses",
            "methodProperties": {
            "CityName": city_name
        }
    }
    departments = []
    parcel_lockers = []
    try:
        resp = requests.post(url, json=data)
    except:
        return flask.jsonify([])
    if resp.status_code == 200:
        for c in resp.json().get('data'):
            name = c.get('Description')
            if 'Поштомат' in name:
                parcel_lockers.append(name)
            else:
                departments.append(name)
    if dep_type == "all":
        return flask.jsonify([*parcel_lockers, *departments])
    return flask.jsonify(parcel_lockers) if dep_type == 'parcel_locker' else flask.jsonify(departments)

def render_order_page():
    if flask.session.get("need_to_authorize"):
        flask.session.pop("need_to_authorize")
        return flask.render_template('order_error.html', msg='Обліковий запис із цією електронною поштою вже існує.', msg2 = 'Якщо це ваша пошта, поверніться на головну сторінку та увійдіть у свій акаунт.')
    product_id = flask.request.args.get('product_id')
    products = []
    products_quantity = {}
    total_price = 0
    total_discounted_price = 0
    is_product_from_cart = True
    if product_id:
        p = Product.query.get(int(product_id))
        if not p:
            return flask.render_template('order_error.html', msg='На жаль, такого товару нема в нашому асортименті.')
        products.append(p)
        total_price = p.price
        total_discounted_price = p.get_discounted_price()
        products_quantity[p.id] = 1
        is_product_from_cart = False
    else:
        for id in _get_cart_ids():
            p = Product.query.get(id)
            if p:
                products.append(p)
                total_price += p.price
                total_discounted_price += p.get_discounted_price()
                products_quantity[p.id] = 1 if not products_quantity.get(p.id) else products_quantity[p.id] + 1
    if not products:
        return flask.render_template('order_error.html', msg='На жаль, ваша корзина порожня.')
    products_set = set(products)
    crd = None
    dst = None
    if current_user.is_authenticated:
        crd = current_user.credentials 
        crd = crd[0] if crd else None
        dst = None if not crd else DATABASE.session.execute(select(Destinations).where(and_(Destinations.checked, Destinations.credentials_id == crd.id))).scalars().first()
    return flask.render_template('order_page.html', 
                                 products=products_set, quantity=products_quantity, 
                                 total_price=total_price, total_discounted_price=total_discounted_price, dst=dst,
                                 crd=crd, city_names=get_city_names(api_key=api_key), is_product_from_cart=is_product_from_cart)

def _send_messages_about_order(products_info, whole_price, crd, order):
    products_text_lines = []
    for pid, info in products_info.items():
        products_text_lines.append(f'- {info["name"]} - {info["count"]} шт - {info["price"]} грн/шт')
    products_text = '\n'.join(products_text_lines)
    req_body = {
    "chat_id": admin_chat_id,
    "text": f"""📦 Нове замовлення #{order.id}

Клієнт: {crd.first_name} {crd.second_name}
{crd.phone_number}
{crd.email}

🛍 Товари:
{products_text}
💰 Разом: {whole_price} грн

🚚 Доставка: {order.delivary_destination.split('|')[0]}, {order.delivary_destination.split('|')[2]}
💳 Оплата: {"Online" if order.payment_method == "now" else "При отриманні"}""" 
    }
    requests.post(url=tg_url, data=req_body)
    
    try:
        msg = Message(subject='Ваше замовлення', recipients=[crd.email])
        msg.body = f"""
Дякуємо за замовлення!

📦 Номер замовлення: {order.id}

🛍 Ваші товари:
{products_text}
💰 Разом: {whole_price} грн

Доставка: {order.delivary_destination.split('|')[0]}, {order.delivary_destination.split('|')[2]}
Оплата: {"Online" if order.payment_method == "now" else "При отриманні"}
        """
        MAIL_MANAGER.send(msg)
    except Exception as e:
        print(e)

def render_success_page():
    order_id = flask.session.get('order_id')
    from_cart = flask.request.args.get('from_cart')
    paied_now = flask.request.args.get('paied_now')
    if order_id:
        flask.session.pop("order_id")
        order = DATABASE.session.execute(select(Order).where(Order.id == order_id)).scalar_one_or_none()
        if order:
            products_info = {}
            whole_price = 0
            for product in order.product_string.split('; ')[:-1]:
                product_id = int(product.split('-')[0])
                whole_price += int(product.split('-')[2])
                if product_id in products_info:
                    products_info[product_id]["count"] += 1
                else:
                    products_info[product_id] = {"name": "", "price": product.split('-')[2], "count": 1}
            products = DATABASE.session.execute(select(Product).where(Product.id.in_(products_info.keys()))).scalars().all()
            for p in products:
                products_info[p.id]["name"] = p.name
            crd = DATABASE.session.get(Credentials, order.credentials_id)
            # _send_messages_about_order(products_info, whole_price, crd, order)
            if paied_now == '1':
                order.is_paied = True
                DATABASE.session.commit()
        else:
            return flask.redirect('/')
        html = flask.render_template('success.html', order_id=order_id)
        resp = flask.make_response(html)
        if from_cart == '1':
            resp.delete_cookie("productsId")
        return resp
    return flask.redirect('/')

def render_error_page():
    order_id = flask.session.get('order_id')
    if order_id:
        flask.session.pop("order_id")
        order = DATABASE.session.execute(select(Order).where(Order.id == order_id)).scalar_one_or_none()
        if order:
            DATABASE.session.delete(order)
            DATABASE.session.commit()
        return flask.render_template('order_error.html', msg='На жаль, платіж не пройшов.', msg2='Спробуйте пізніше або виберіть інший спосіб оплати.')
    return flask.redirect('/')

def _validate_number(phone_number):
    return re.match(r"^\+38\s\(0\d{2}\)\s\d{3}-\d{2}-\d{2}$", phone_number)

def _validate_email(email):
    return re.match(r"^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email)

def _make_product_string(products, count):
    if len(products) > 1:
        count = 1
    product_string = ''
    for p in products:
        product_string += f"{p.id}-{p.price}-{p.get_discounted_price()}; "*count
    return product_string

def _make_credentials(data, user_id=None):
    crd = Credentials(
        second_name = data.get("second_name"),
        first_name = data.get("first_name"),
        father_name = data.get("father_name"),
        phone_number = data.get("phone_number"),
        email = data.get("email"),
        user_id = user_id
        )
    DATABASE.session.add(crd)
    DATABASE.session.commit()
    return crd

def _make_destination(data, crd_id):
    dst = DATABASE.session.execute(select(Destinations).where(and_(
        Destinations.credentials_id == crd_id, 
        Destinations.place == data.get(data.get('delivery_type')),
        Destinations.city == data.get("city")))).scalars().first()
    chosen_dst = DATABASE.session.execute(select(Destinations).where(and_(
        Destinations.checked, 
        Destinations.credentials_id == crd_id))).scalars().first()
    if chosen_dst:
        chosen_dst.checked = False
    if not dst:
        new_dst = Destinations(
            city=data.get("city"), type=data.get("delivery_type"), 
            place=data.get(data.get('delivery_type')), checked=True, credentials_id=crd_id)
        DATABASE.session.add(new_dst)
    else:
        dst.checked = True
    DATABASE.session.commit()

def _check_destination(city, dest):
    data = {
            "apiKey": api_key,
            "modelName": "Address",
            "calledMethod": "getWarehouses",
            "methodProperties": {
                "CityName": city,
                "FindByString": dest
        }
    }
    url = 'https://api.novaposhta.ua/v2.0/json/'
    try:
        resp = requests.post(url, json=data)
    except:
        return False
    if resp.json().get("data") and resp.json().get("data")[0].get("Description") == dest:
        return True
    return False

def make_order():
    data = flask.request.get_json()
    req_data = data.get("data")
    required = ["first_name", "second_name", "delivery_type", "payment_type", "city"]
    for r in required:
        if not req_data.get(r) or not req_data.get(r).strip():
            return flask.jsonify({"error": "missed_field", "name": r, "msg": "Це поле обов'язкове"})
    if req_data.get("delivery_type") not in ("department", "parcel_locker"):
        return flask.jsonify({"error": "missed_field", "name": "delivery_type", "msg": "Це поле обов'язкове"})
    if not "phone_number" in req_data or not _validate_number(req_data.get("phone_number")):
        return flask.jsonify({"error": "invalid_number", "name": "phone_number", "msg": "Неправильний номер телефону"})
    if not "email" in req_data or not _validate_email(req_data.get("email")):
        return flask.jsonify({"error": "invalid_email", "name": "email", "msg": "Неправильна адреса електронноъ пошти"})
    if not _check_destination(req_data.get("city"), req_data.get(req_data.get('delivery_type'))):
        return flask.jsonify({"error": "missed_field", "name": req_data.get('delivery_type'), "msg": "Неправильне місце доставки"})
    if not current_user.is_authenticated:
        existing_crd = DATABASE.session.execute(select(Credentials).where(Credentials.email == req_data.get("email"))).scalars().first()
        if existing_crd:
            flask.session["need_to_authorize"] = True
            return flask.jsonify({"error": "need_to_authorize"})
        crd = _make_credentials(req_data)
    else:
        if not current_user.credentials:
            crd = _make_credentials(req_data, current_user.id)
        else:
            crd = current_user.credentials[0]
    products = []
    if req_data.get("product_id"):
        p = DATABASE.session.get(Product, int(req_data.get("product_id")))
        if not p:
            return flask.jsonify({"error": "invalid_id", "id": req_data.get("product_id")})
        products.append(p)
    else:
        for id in _get_cart_ids():
            p = DATABASE.session.get(Product, id)
            if p:
                products.append(p)
        if not products:
            return flask.jsonify({"error": "empty_cart"})
    _make_destination(req_data, crd.id)
    order = Order(
        comment = req_data.get("comment"),
        delivary_destination = f"{req_data.get('city')} | {req_data.get('delivery_type')} | {req_data.get(req_data.get('delivery_type'))}",
        payment_method = req_data.get("payment_type"),
        is_paied = False,
        date = datetime.today().strftime('%d.%m.%Y'),
        status = 'Оформлено-1',
        product_string = _make_product_string(products, req_data.get("product_quantity", 1)),
        credentials_id = crd.id
    )
    DATABASE.session.add(order)
    DATABASE.session.commit()
    flask.session["order_id"] = order.id
    from_cart = req_data.get("from_cart")
    if req_data.get("payment_type") == "now":
        if req_data.get("bank_type") == "mono":
            return flask.jsonify({"res": "ok", "url": redirect_payment(order.calc_overall_price(), from_cart)})
        else:
            return flask.jsonify({"res": "ok", "url": 'liqpay'})
    else:
        return flask.jsonify({"res": "ok", "url": f'success?paied_now=0&from_cart={from_cart}'})
    
def render_liqpay():
    order_id = flask.session.get('order_id')
    if order_id:
        order = DATABASE.session.get(Order, int(order_id))
        html = create_liqpay(order.calc_overall_price(), order.id)
        return flask.render_template('liqpay.html', liqpay_html = html)
    return flask.redirect('/')

def render_liqpay_result():
    order_id = flask.session.get('order_id')
    if order_id:
        order = DATABASE.session.get(Order, int(order_id))
        if order.is_paied:
            return flask.redirect('/success?from_cart={from_cart}&paied_now=1')
        else:
            return flask.redirect('/error_payment')
    return flask.redirect('/')

def validate_liqpay():
    liqpay = LiqPay(liq_public, liq_private)
    data = flask.request.form.get('data')
    signature = flask.request.form.get('signature')
    sign = liqpay.str_to_sign(liq_private + data + liq_private)
    if sign != signature:
        return 'Error'
    info = liqpay.decode_data_from_str(data)
    order_id = info.get("order_id")
    status = info.get("status")
    order = DATABASE.session.get(Order, int(order_id))
    if order:
        if status in ("success", "sandbox"):
            order.is_paied = True
            print('true')
        else:
            order.is_paied = False
            print('false')
        DATABASE.session.commit()
    return "OK"