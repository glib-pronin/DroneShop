from main_page import *
from catalog_page import *
from profile_page import *
from about_us_page import *

main.add_url_rule(rule='/', view_func=render_main_page)

about_us.add_url_rule(rule='/about_us', view_func=render_about_us_page)

catalog.add_url_rule(rule='/catalog', view_func=render_catalog, methods=['GET', 'POST'])
catalog.add_url_rule(rule='/add_section', view_func=add_section_to_product, methods=['POST'])
catalog.add_url_rule(rule='/api/products', view_func=get_products, methods=['GET', 'POST'])
catalog.add_url_rule(rule='/product/<int:id>', view_func=render_product)

catalog.add_url_rule(rule='/get_cart', view_func=get_cart)
catalog.add_url_rule(rule='/delete_product_from_cart', view_func=delete_product_from_cart, methods=['POST'])
catalog.add_url_rule(rule='/increment_product_quantity', view_func=increment_product, methods=['POST'])
catalog.add_url_rule(rule='/decrement_product_quantity', view_func=decrement_product, methods=['POST'])

profile.add_url_rule('/register', view_func=register, methods=['POST'])
profile.add_url_rule('/login', view_func=login, methods=['POST'])
profile.add_url_rule('/send_code', view_func=send_code, methods=['POST'])
profile.add_url_rule('/verify_code', view_func=verify_code, methods=['POST'])
profile.add_url_rule('/reset_password', view_func=reset_password, methods=['POST'])