from .urls import *
from .settings import *
from .db import *
from .login_manager import *

from main_page import main

project.register_blueprint(main)