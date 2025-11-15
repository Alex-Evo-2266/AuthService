from app.pkg import QueueConsumer
from app.configuration.settings import RABITMQ_HOST, RABITMQ_PORT, EMAIL_QUEUE
from app.internal.email.logic.email import send_email_callback
import logging

logger = logging.getLogger(__name__)

# слушатели
emailListener = QueueConsumer(host=RABITMQ_HOST, port=RABITMQ_PORT, queue=EMAIL_QUEUE, callback=send_email_callback, logger=logger)