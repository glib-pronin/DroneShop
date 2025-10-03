from main_page import *
from catalog_page import *
from profile_page import *

main.add_url_rule(rule='/', view_func=render_main_page)

catalog.add_url_rule(rule='/catalog', view_func=render_catalog, methods=['GET', 'POST'])
catalog.add_url_rule(rule='/product/<int:id>', view_func=render_product)

profile.add_url_rule('/register', view_func=register, methods=['POST'])
profile.add_url_rule('/login', view_func=login, methods=['POST'])
profile.add_url_rule('/send_code', view_func=send_code, methods=['POST'])
profile.add_url_rule('/verify_code', view_func=verify_code, methods=['POST'])
profile.add_url_rule('/reset_password', view_func=reset_password, methods=['POST'])