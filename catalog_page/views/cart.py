import flask
from ..models import Product, select, DATABASE

def _get_cart_ids():
    cart = flask.request.cookies.get('productsId')
    return cart.split('|') if cart else []

def _get_total_prices(list_id):
    discount = 0
    price = 0
    if list_id:
        int_list_id = [int(id) for id in list_id]
        set_ids = set(int_list_id)
        products = DATABASE.session.execute(select(Product).where(Product.id.in_(set_ids))).scalars().all()
        for product in products:
            discount += product.get_discounted_price()*int_list_id.count(product.id)
            price += product.price*int_list_id.count(product.id)
    return {"price": price, "discount": discount}

def _save_cart_ids(ids, data):
    response = flask.make_response(flask.jsonify(data))
    if ids:
        response.set_cookie('productsId', '|'.join(ids))
    else:
        response.delete_cookie('productsId')
    return response

def _validate_cart_item(carts_id, item_id):
    if not carts_id:
        return _save_cart_ids([], {"cartIsEmpty": True, "price": 0, "discount": 0})
    if item_id not in carts_id:
        return flask.jsonify({"notContained": True})
    return None

def get_cart():
    list_products = []
    cart_ids = _get_cart_ids()
    if cart_ids:
        list_used_id = []
        for id in cart_ids:
            if id not in list_used_id:
                product = DATABASE.session.get(Product, int(id))
                if product:
                    list_products.append({
                        "id": product.id,
                        'name': product.name,
                        'image': product.get_path(),
                        'price': product.price,
                        'discount': product.get_discounted_price(),
                        "count": cart_ids.count(id)
                    })
                    list_used_id.append(id)
    return flask.jsonify({'list_product': list_products})

def delete_product_from_cart():
    data = flask.request.get_json()
    item_id = data.get("itemId")
    cart_ids = _get_cart_ids()
    filtered_list_id = [id for id in cart_ids if id != str(item_id)]
    prices = _get_total_prices(filtered_list_id)
    return _save_cart_ids(filtered_list_id, prices)

def increment_product():
    data = flask.request.get_json()
    item_id = str(data.get("itemId"))
    cart_ids = _get_cart_ids()
    if not cart_ids:
        return _save_cart_ids([], {"cartIsEmpty": True, "price": 0, "discount": 0})
    if item_id not in cart_ids:
        return flask.jsonify({"notContained": True})
    cart_ids.append(item_id)
    res_data = _get_total_prices(cart_ids)
    res_data.update({"notContained": False, "cartIsEmpty": False, "quantity": cart_ids.count(item_id)})
    return _save_cart_ids(cart_ids, res_data)

def decrement_product():
    data = flask.request.get_json()
    item_id = str(data.get("itemId"))
    cart_ids = _get_cart_ids()
    validation_res = _validate_cart_item(cart_ids, item_id)
    if validation_res:
        return validation_res 
    cart_ids.remove(item_id)
    validation_res = _validate_cart_item(cart_ids, item_id)
    if validation_res:
        return validation_res 
    res_data = _get_total_prices(cart_ids)
    res_data.update({"notContained": False, "cartIsEmpty": False, "quantity": cart_ids.count(item_id)})
    return _save_cart_ids(cart_ids, res_data)
