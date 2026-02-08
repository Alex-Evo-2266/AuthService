
class InvalidAccess(Exception):
	def __init__(self, *args: object) -> None:
		if args:
			self.message = args[0]
		else:
			self.message = "invalid access"
	
	def __str__(self) -> str:
		if self.message:
			return f"InvalidAccess, {self.message}"
		else:
			return "InvalidAccess"
		
class AccessExpired(Exception):
	def __init__(self, *args: object) -> None:
		if args:
			self.message = args[0]
		else:
			self.message = "token expired"
	
	def __str__(self) -> str:
		if self.message:
			return f"AccessExpired, {self.message}"
		else:
			return "AccessExpired"

class NoToken(Exception):
	def __init__(self, *args: object) -> None:
		if args:
			self.message = args[0]
		else:
			self.message = "no token"
	
	def __str__(self) -> str:
		if self.message:
			return f"NoToken, {self.message}"
		else:
			return "NoToken"