import flask

admin_panel = flask.Blueprint(
    import_name='admin_panel',
    name='admin_panel',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_admin'
)