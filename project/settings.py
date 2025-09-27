import flask, os

db_path = os.path.abspath(__file__ + '/../db')

project = flask.Flask(
    import_name="project",
    instance_path=db_path
)

