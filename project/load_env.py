import dotenv, os

env_path = os.path.abspath(__file__ + '/../../.env')

seckret_key = dotenv.get_key(env_path, 'SECRET_KEY')
email = dotenv.get_key(env_path, 'EMAIL')
password = dotenv.get_key(env_path, 'PASSWORD')
api_key = dotenv.get_key(env_path, 'APi_NOVA_POSHTA')
mono_api_key = dotenv.get_key(env_path, 'MONO_API')
liq_public = dotenv.get_key(env_path, 'LIQ_PAY_PUBLIC')
liq_private = dotenv.get_key(env_path, 'LIQ_PAY_PRIVATE')