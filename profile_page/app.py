import flask 

profile = flask.Blueprint(
    name='profile',
    import_name='profile_page',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_profile'
)