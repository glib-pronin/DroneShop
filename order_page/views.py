import flask
from catalog_page.models import Product
from profile_page.models import Credentials
from catalog_page.views.cart import _get_cart_ids
from flask_login import current_user
from .models import Order

def render_order_page():
    product_id = flask.request.args.get('product_id')
    products = []
    products_quantity = {}
    total_price = 0
    total_discounted_price = 0
    if product_id:
        p = Product.query.get(int(product_id))
        if not p:
            return flask.redirect('/catalog')
        products.append(p)
        total_price = p.price
        total_discounted_price = p.get_discounted_price()
        products_quantity[p.id] = 1
    else:
        for id in _get_cart_ids():
            p = Product.query.get(id)
            if p:
                products.append(p)
                total_price += p.price
                total_discounted_price += p.get_discounted_price()
                products_quantity[p.id] = 1 if not products_quantity.get(p.id) else products_quantity[p.id] + 1
    products_set = set(products)
    crd = None
    if current_user.is_authenticated:
        crd = current_user.credentials 
        crd = crd[0] if crd else None
    print(products_quantity)
    return flask.render_template('order_page.html', 
                                 products=products_set, quantity=products_quantity, 
                                 total_price=total_price, total_discounted_price=total_discounted_price,
                                 crd = crd)

def render_success_page():
     order_id = flask.request.args.get('order_id')
     return flask.render_template('success.html', order_id=order_id)