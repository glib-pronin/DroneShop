import flask, re
from flask_login import current_user
from collections import defaultdict
from catalog_page.models import Product, DATABASE, select, and_
from order_page.models import Order
from .destinations import _safe_id
from ..decorators import login_required
from catalog_page.decorator import admin_required

def _get_short_place(place):
    parts = place.split(':')
    parts[1] = re.sub(r'\s\(.*\)', '', parts[1])
    return ':'.join(parts)

def _collect_orders_dict(orders):
    orders_dict = {}

    all_product_ids = set()
    for order in orders:
        products = order.product_string.split('; ')[:-1]
        for product in products:
            all_product_ids.add(int(product.split('-')[0]))
    products = DATABASE.session.execute(select(Product).where(Product.id.in_(all_product_ids))).scalars().all()

    products_dict = {p.id: p for p in products}
    for order in orders:
        product_info = []
        products_map = defaultdict(lambda: {"count": 0, "price": 0, "discounted": 0})
        products = order.product_string.split('; ')[:-1]
        overall_price = 0
        overall_price_without_discount = 0
        for p in products:
            data = p.split('-')
            products_map[p[0]]["count"] += 1
            products_map[p[0]]["price"] = int(data[1])
            products_map[p[0]]["discounted"] = int(data[2])
            overall_price += int(data[2])
            overall_price_without_discount += int(data[1])
        for p_id, data in products_map.items():
            product = products_dict.get(int(p_id))
            product_info.append({
                "id": p_id,
                "name": product.name,
                "image_path": product.get_path(),
                "price": data["price"],
                "count": data["count"],
                "discounted": data["discounted"]
            })
        dest = order.delivary_destination.split(' | ')
        status = order.status.split('-')
        orders_dict[order.id] = {
            "products": product_info,
            "overall_price": overall_price,
            "overall_price_without_discount": overall_price_without_discount,
            "date": order.date,
            "status": status[0],
            "status_code": status[1],
            "shipment_number": order.shipment_number,
            "city": dest[0],
            "delivery_type": dest[1],
            "dest": _get_short_place(dest[2]),
            "user": {
                "first_name": order.credentials.first_name,
                "second_name": order.credentials.second_name,
                "phone_number": order.credentials.phone_number
            }
        }
    return orders_dict

@login_required
def render_user_orders():
    crd = current_user.credentials
    crd = crd[0] if crd else None
    if flask.request.method == "POST":
        data = flask.request.get_json()
        order_id = _safe_id(data.get("orderId"))
        if not crd or not order_id:
            return flask.jsonify({"success": False, "error": "invalid data"})
        order = DATABASE.session.execute(select(Order).where(and_(
            Order.credentials_id == crd.id,
            Order.id == order_id,
            Order.status != "Отримано-5",
            Order.status != "Скасовано-6"))).scalar_one_or_none()
        if not order :
            return flask.jsonify({"success": False, "error": "such order does not exist"})
        order.status = "Скасовано-6"
        DATABASE.session.commit()
        return flask.jsonify({"success": True})
    if current_user.is_admin:
        orders = DATABASE.session.execute(select(Order)).scalars().all()
    else:
        orders = crd.orders if crd else None
    orders_dict = None
    if orders:
        for o in list(orders):
            if o.payment_method == "now" and not o.is_paied:
                DATABASE.session.delete(o)
        DATABASE.session.commit()
        orders = DATABASE.session.execute(select(Order)).scalars().all() if current_user.is_admin else crd.orders
    if orders:  
        orders_dict = _collect_orders_dict(orders)
    return flask.render_template('orders.html', my_orders_class='selected', orders_dict=orders_dict)

@admin_required
def update_shipment_number():
    data = flask.request.get_json()
    order_id = _safe_id(data.get("order_id"))
    shipment_number = data.get("shipment_number")
    if not order_id:
        return flask.jsonify({"success": False, "error": "invalid id"})
    order = DATABASE.session.get(Order, order_id)
    if not order:
        return flask.jsonify({"success": False, "error": "such an order does not exist"})
    if shipment_number == "Ще не визначений" or shipment_number in ('0', ''):
        order.shipment_number = None
        value_for_front = "Ще не визначений"
    else:
        order.shipment_number = shipment_number
        value_for_front = shipment_number
    DATABASE.session.commit()
    return flask.jsonify({"success": True, "shipmentNumber": value_for_front})

