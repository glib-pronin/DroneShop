from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .settings import project

LIMITER = Limiter(
    get_remote_address,
    app=project,
    storage_uri='memory://'
)