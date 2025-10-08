import flask, os
from ..models import Product, DATABASE

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
