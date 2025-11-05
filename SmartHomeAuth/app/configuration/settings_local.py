import os

MYSQL_USER = "roothomeauth"
MYSQL_PASSWORD = "root"
MYSQL_DATABASE = "SmartHomeAuth"
MYSQL_HOST = "localhost"
MYSQL_PORT = "3308"

EMAIL_TOPIK = os.environ.get("EMAIL_TOPIK")
EMAIL_QUEUE = os.environ.get("EMAIL_QUEUE")

RABITMQ_HOST = os.environ.get("RABITMQ_HOST")
RABITMQ_PORT = os.environ.get("RABITMQ_PORT")

DEBUG = True
