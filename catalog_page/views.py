import flask, os
from .models import Product, DATABASE

products_path = os.path.abspath(__file__+'/../static/images/products')

def render_catalog():
    if flask.request.method == 'POST':
        product = Product(
            name = flask.request.form.get('name'),
            price = flask.request.form.get('price'),
            discount = flask.request.form.get('discount'),
            summary = flask.request.form.get('summary'),
            html_description = ''
        )
        DATABASE.session.add(product)
        DATABASE.session.commit()
        image = flask.request.files.get('image')
        image.save(dst=f'{products_path}/{product.id}_{product.name.replace(" ", "_")}.png')
    products = Product.query.all()
    print(len(products))
    return flask.render_template(template_name_or_list='catalog.html', products=products)

def render_product(id: int):
    product = Product.query.filter_by(id=id).first()
    if not product:
        return flask.redirect('/catalog')
    return flask.render_template(template_name_or_list='product.html', product=product)

def get_cart():
    cart = flask.request.cookies.get('productsId')
    list_products = []
    if cart:
        list_id = cart.split('|')
        list_used_id = []
        for id in list_id:
            if id not in list_used_id:
                product = Product.query.get(int(id))
                if product:
                    list_products.append({
                        "id": product.id,
                        'name': product.name,
                        'image': product.get_path(),
                        'price': product.price,
                        'discount': product.get_discounted_price(),
                        "count": list_id.count(id)
                    })
                    list_used_id.append(id)
    return flask.jsonify({'list_product': list_products})

def get_total_prices(list_id):
    discount = 0
    price = 0
    for id in list_id:
        product = Product.query.get(int(id))
        if product:
            discount += product.get_discounted_price()
            price += product.price
    print(price, discount)
    return {"price": price, "discount": discount}

def delete_product_from_cart():
    data = flask.request.get_json()
    item_id = data.get("itemId")
    cart = flask.request.cookies.get('productsId')
    if cart:
        list_id = cart.split('|')
        filtered_list_id = [id for id in list_id if id != str(item_id)]
        prices = get_total_prices(filtered_list_id)
        response = flask.make_response(flask.jsonify(prices))
        if filtered_list_id:
            response.set_cookie('productsId', '|'.join(filtered_list_id))
        else:
            response.delete_cookie('productsId')
        return response

    return flask.jsonify({"price": 0, "discount": 0})

def increment_product():
    data = flask.request.get_json()
    item_id = data.get("itemId")
    cart = flask.request.cookies.get('productsId')
    if cart:
        list_id = cart.split('|')
        if str(item_id) not in list_id:
            return flask.jsonify({"notContained": True})
        new_list_id = list_id.copy()
        new_list_id.append(str(item_id))
        res_data = get_total_prices(new_list_id)
        res_data["notContained"] = False
        res_data["cartIsEmpty"] = False
        res_data["quantity"] = new_list_id.count(str(item_id))
        response = flask.make_response(flask.jsonify(res_data))
        response.set_cookie('productsId', '|'.join(new_list_id))
        return response
    return flask.jsonify({"cartIsEmpty": True, "price": 0, "discount": 0})

def decrement_product():
    data = flask.request.get_json()
    item_id = data.get("itemId")
    cart = flask.request.cookies.get('productsId')
    if cart:
        list_id = cart.split('|')
        if str(item_id) not in list_id:
            return flask.jsonify({"notContained": True})
        new_list_id = list_id.copy()
        new_list_id.remove(str(item_id))
        if not new_list_id:
            res_data = {"cartIsEmpty": True}
            response = flask.make_response(flask.jsonify(res_data))
            response.delete_cookie('productsId')
            return response
        if str(item_id) not in new_list_id:
            return flask.jsonify({"notContained": True})
        res_data = get_total_prices(new_list_id)
        res_data["notContained"] = False
        res_data["cartIsEmpty"] = False
        res_data["quantity"] = new_list_id.count(str(item_id))
        response = flask.make_response(flask.jsonify(res_data))
        response.set_cookie('productsId', '|'.join(new_list_id))
        return response
    return flask.jsonify({"cartIsEmpty": True, "price": 0, "discount": 0})

