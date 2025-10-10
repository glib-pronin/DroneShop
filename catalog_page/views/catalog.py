import flask, os, math
from ..models import Product, DATABASE, select

products_path = os.path.abspath(__file__+'/../../static/images/products')

ITEMS_PER_PAGE = 5

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
    return flask.render_template(template_name_or_list='catalog.html')

def get_products():
    page = int(flask.request.args.get("page", 1))
    page = max(page, 1)
    products = DATABASE.session.execute(select(Product)).scalars().all()
    total_products = len(products)
    total_pages = math.ceil(total_products/ITEMS_PER_PAGE)
    page = min(page, total_pages)
    start = ITEMS_PER_PAGE*(page-1)
    end = start + ITEMS_PER_PAGE
    page_items = products[start:end]
    product_dict = [
        {
            "id": p.id,
            "name": p.name,
            "image": p.get_path(),
            "price": p.price,
            "discount": p.get_discounted_price()
        }
        for p in page_items
    ]
    return flask.jsonify({ 'currentPage': page, 'products': product_dict, 'totalPages': total_pages })

def render_product(id: int):
    product = Product.query.filter_by(id=id).first()
    if not product:
        return flask.redirect('/catalog')
    return flask.render_template(template_name_or_list='product.html', product=product)