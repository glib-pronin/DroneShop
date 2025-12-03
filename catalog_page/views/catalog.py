import flask, os, math
from flask_login import current_user
from ..decorator import admin_required
from ..models import Product, Section, DATABASE, select, and_

products_images_path = os.path.abspath(__file__+'/../../static/images/products')
products_videos_path = os.path.abspath(__file__+'/../../static/videos')

ITEMS_PER_PAGE = 6

def _check_data(data):
    name = data.get("name")
    price = data.get("price")
    discount = data.get("discount")
    if not name or not price or not discount:
        return False
    return True

def render_catalog():
    if flask.request.method == 'POST':
        if not current_user.is_authenticated or not current_user.is_admin:
            return flask.jsonify({"success": False, "error": "rights_error"})
        if not _check_data(flask.request.form):
            return flask.jsonify({"success": False, "error": "invalid_data"})
        product = Product(
            name = flask.request.form.get('name'),
            price = flask.request.form.get('price'),
            discount = flask.request.form.get('discount'),
            summary = flask.request.form.get('summary'),
            type = flask.request.form.get('type')
        )
        DATABASE.session.add(product)
        DATABASE.session.commit()
        image = flask.request.files.get('image')
        os.makedirs(products_images_path, exist_ok=True)
        image.save(dst=f'{products_images_path}/{product.id}_{product.name.replace(" ", "_")}.png')
        return flask.jsonify({"success": True})
    products = DATABASE.session.execute(select(Product)).scalars().all()
    return flask.render_template(template_name_or_list='catalog.html', products=products)

@admin_required
def get_product_info(productId):
    product = DATABASE.session.get(Product, productId)
    if product:
        return flask.jsonify({"success": True, "info": {"name": product.name, "price": product.price, 
                                                        "discount": product.discount, "type": product.type, 
                                                        "summary": product.summary, "imageName": product.get_path().split('/')[2]}})
    return flask.jsonify({"success": False, "error": "incorrect_id"})

@admin_required
def delete_product():
    data = flask.request.get_json()
    product = DATABASE.session.get(Product, int(data.get("id")))
    if not product:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    image_path = f'{products_images_path}/{product.id}_{product.name.replace(" ", "_")}.png'
    if os.path.exists(image_path):
        os.remove(image_path)
    DATABASE.session.delete(product)
    DATABASE.session.commit()
    return flask.jsonify({"success": True})

@admin_required
def update_product():
    product = DATABASE.session.get(Product, int(flask.request.form.get("id")))
    if not product:
        return flask.jsonify({"success": False, "error": "incorrect_id"})
    if not _check_data(flask.request.form):
            return flask.jsonify({"success": False, "error": "invalid_data"})
    old_name = product.name
    old_path = f'{products_images_path}/{product.id}_{old_name.replace(" ", "_")}.png'
    new_name = flask.request.form.get("name")
    product.name = new_name
    product.price = flask.request.form.get("price")
    product.discount = flask.request.form.get("discount")
    product.type = flask.request.form.get("type")
    product.summary = flask.request.form.get("summary")

    image = flask.request.files.get("image")
    new_path = f'{products_images_path}/{product.id}_{new_name.replace(" ", "_")}.png'
    if image:
        if os.path.exists(old_path):
            os.remove(old_path)
        os.makedirs(products_images_path, exist_ok=True)
        image.save(new_path)
    elif new_name != old_name:
        if os.path.exists(old_path):
            os.rename(old_path, new_path)

    DATABASE.session.commit()
    return flask.jsonify({"success": True})

def get_products():
    page = int(flask.request.args.get("page", 1))
    type = flask.request.args.get('type', 'all')
    print(page, type)
    page = max(page, 1)
    if type == 'all':
        products = DATABASE.session.execute(select(Product)).scalars().all()
    else:
        products = DATABASE.session.execute(select(Product).where(Product.type == type)).scalars().all()
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
    is_admin = False if not current_user.is_authenticated else current_user.is_admin
    return flask.jsonify({ 'currentPage': page, 'products': product_dict, 'totalPages': total_pages, "isAdmin": is_admin })

def render_product(id: int):
    product = DATABASE.session.execute((select(Product).where(Product.id == id))).scalar_one_or_none()
    if not product:
        return flask.redirect('/catalog')
    similiar_products = DATABASE.session.execute(select(Product).where(and_(Product.type == product.type, Product.id != product.id)).limit(4)).scalars().all()
    return flask.render_template(template_name_or_list='product.html', product=product, similiar_products = similiar_products, sections = product.sections)

