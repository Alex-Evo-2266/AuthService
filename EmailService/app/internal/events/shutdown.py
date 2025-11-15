import logging
from app.pkg import __config__
from app.internal.email.listener.email_listener import emailListener

logger = logging.getLogger(__name__)

async def shutdown():

	__config__.save()

	emailListener.stop()
	logger.info("stop")
