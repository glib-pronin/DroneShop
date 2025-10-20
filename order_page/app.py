import flask

order = flask.Blueprint(
    name='order',
    import_name='order_page',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_order'
)