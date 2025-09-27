import flask

main = flask.Blueprint(
    import_name='main_page',
    name='main',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_main'
)