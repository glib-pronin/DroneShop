from .urls import *
from .settings import *
from .db import *
from .login_manager import *
from .mail_manager import *

from main_page import main
from catalog_page import catalog
from profile_page import profile
from about_us_page import about_us
from contacts_page import contacts

project.register_blueprint(main)
project.register_blueprint(catalog)
project.register_blueprint(profile)
project.register_blueprint(about_us)
project.register_blueprint(contacts)