import flask

catalog = flask.Blueprint(
    import_name='catalog_page',
    name='catalog',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_catalog'
)
