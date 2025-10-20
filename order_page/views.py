import flask
from catalog_page.models import Product
from profile_page.models import Credentials
from catalog_page.views.cart import _get_cart_ids
from flask_login import current_user
from .models import Order

def render_order_page():
    product_id = flask.request.args.get('product_id')
    products = []
    if product_id:
        p = Product.query.get(int(product_id))
        if not p:
            return flask.redirect('/catalog')
        products.append(p)
    else:
        for id in _get_cart_ids():
            p = Product.query.get(id)
            if p:
                products.append(p)
    crd = None
    if current_user.is_authenticated:
        crd = current_user.credentials 
        crd = crd[0] if crd else None
        print(crd)
    return flask.render_template('order_page.html', products=products, credentials = crd)