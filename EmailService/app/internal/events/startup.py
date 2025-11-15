import logging, asyncio
from app.pkg import itemConfig, ConfigItemType, __config__
from app.internal.email.listener.email_listener import emailListener

logger = logging.getLogger(__name__)

# def onMessage(ch, method, properties, body):
# 	print(body)
# 	print(ch, method, properties, body)
# 	send_email_callback()

async def startup():

	__config__.register_config(itemConfig(
		tag="email",
		key="email"
	))

	__config__.register_config(itemConfig(
		tag="email",
		key="password",
		type=ConfigItemType.PASSWORD
	))
	
	logger.info("generete config")

	await __config__.load()
	  
	emailListener.start()

	logger.info("starting")

	  
