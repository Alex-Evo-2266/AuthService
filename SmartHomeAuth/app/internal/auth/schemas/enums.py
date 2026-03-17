
from enum import Enum

class TypeSession(str, Enum):
	COOKIES = "cookies"
	OAUTH = "oauth"
	ACCESS_AND_REFRESH = "access_and_refresh"