from main_page import *
from catalog_page import *
from profile_page import *
from about_us_page import *
from contacts_page import *
from order_page import *

main.add_url_rule(rule='/', view_func=render_main_page)

about_us.add_url_rule(rule='/about_us', view_func=render_about_us_page)

contacts.add_url_rule(rule='/contacts', view_func=render_contacts_page)
contacts.add_url_rule(rule='/send_message', view_func=send_message, methods=['POST'])
contacts.register_error_handler(429, handle_limiter_error)

order.add_url_rule(rule='/order', view_func=render_order_page)
order.add_url_rule(rule='/success', view_func=render_success_page)
order.add_url_rule(rule='/error_payment', view_func=render_error_page)
order.add_url_rule(rule='/liqpay', view_func=render_liqpay)
order.add_url_rule(rule='/api/departments', view_func=get_departments, methods=['POST'])
order.add_url_rule(rule='/make_order', view_func=make_order, methods=['POST'])
order.add_url_rule(rule='/validate_liqpay', view_func=validate_liqpay, methods=['POST'])
order.add_url_rule(rule='/liqpay_result', view_func=render_liqpay_result)

catalog.add_url_rule(rule='/catalog', view_func=render_catalog, methods=['GET', 'POST'])
catalog.add_url_rule(rule='/add_section', view_func=add_section_to_product, methods=['POST'])
catalog.add_url_rule(rule='/api/products', view_func=get_products, methods=['GET', 'POST'])
catalog.add_url_rule(rule='/product/<int:id>', view_func=render_product)

catalog.add_url_rule(rule='/get_cart', view_func=get_cart)
catalog.add_url_rule(rule='/delete_product_from_cart', view_func=delete_product_from_cart, methods=['POST'])
catalog.add_url_rule(rule='/increment_product_quantity', view_func=increment_product, methods=['POST'])
catalog.add_url_rule(rule='/decrement_product_quantity', view_func=decrement_product, methods=['POST'])

profile.add_url_rule(rule='/register', view_func=register, methods=['POST'])
profile.add_url_rule(rule='/login', view_func=login, methods=['POST'])
profile.add_url_rule(rule='/send_code', view_func=send_code, methods=['POST'])
profile.add_url_rule(rule='/verify_code', view_func=verify_code, methods=['POST'])
profile.add_url_rule(rule='/reset_password', view_func=reset_password, methods=['POST'])

profile.add_url_rule(rule='/credentials', view_func=render_credentials, methods=['GET', 'POST'])
profile.add_url_rule(rule='/destinations', view_func=render_user_destinations, methods=['GET', 'POST'])
profile.add_url_rule(rule='/choose_destination', view_func=choose_destination, methods=['POST'])
profile.add_url_rule(rule='/orders', view_func=render_user_orders, methods=['GET', 'POST'])
profile.add_url_rule(rule='/logout', view_func=logout)