from flask import render_template
from catalog_page.models import DATABASE, select, Product

def render_main_page():
    products = DATABASE.session.execute(select(Product).limit(4)).scalars().all()
    return render_template('main_page.html', products=products)