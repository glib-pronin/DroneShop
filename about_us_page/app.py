import flask

about_us = flask.Blueprint(
    name='about_us',
    import_name='about_us_page',
    template_folder='templates',
    static_folder='static',
    static_url_path='/static_about_us'
)