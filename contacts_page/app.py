import flask

contacts = flask.Blueprint(
    name='contacts',
    import_name='contacts_page',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_contacts'
)