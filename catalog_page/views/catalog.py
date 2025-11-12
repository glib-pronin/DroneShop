import flask, os, math
from ..models import Product, Section, DATABASE, select, and_

products_images_path = os.path.abspath(__file__+'/../../static/images/products')
products_videos_path = os.path.abspath(__file__+'/../../static/videos')

ITEMS_PER_PAGE = 6

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
        os.makedirs(products_images_path, exist_ok=True)
        image.save(dst=f'{products_images_path}/{product.id}_{product.name.replace(" ", "_")}.png')
    products = DATABASE.session.execute(select(Product)).scalars().all()
    return flask.render_template(template_name_or_list='catalog.html', products=products)

def add_section_to_product():
    section = Section(
        title=flask.request.form.get('title'),
        section_text=flask.request.form.get('section_text'),
        position = flask.request.form.get('position'),
        product_id = flask.request.form.get('product_id')
    )
    DATABASE.session.add(section)
    DATABASE.session.commit()
    print(flask.request.form.get("statistic"))
    if section.position == "center":
        section.statistic_string = flask.request.form.get("statistic")
    image = flask.request.files.get('image')
    video = flask.request.files.get('video')
    os.makedirs(products_videos_path, exist_ok=True)
    os.makedirs(products_images_path, exist_ok=True)
    if image:
        filename = f'{section.id}_{section.position}_image.png'
        image.save(f'{products_images_path}/{filename}')
        section.image_path = filename
    elif video:
        filename = f'{section.id}_{section.position}_video.mp4'
        video.save(f'{products_videos_path}/{filename}')
        section.video_path = filename
    DATABASE.session.commit()
    return flask.redirect('/catalog')

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
    return flask.jsonify({ 'currentPage': page, 'products': product_dict, 'totalPages': total_pages })

def render_product(id: int):
    product = DATABASE.session.execute((select(Product).where(Product.id == id))).scalar_one_or_none()
    if not product:
        return flask.redirect('/catalog')
    similiar_products = DATABASE.session.execute(select(Product).where(and_(Product.type == product.type, Product.id != product.id)).limit(4)).scalars().all()
    return flask.render_template(template_name_or_list='product.html', product=product, similiar_products = similiar_products, sections = product.sections)

