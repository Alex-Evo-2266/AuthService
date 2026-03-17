from pydantic import BaseModel
from app.internal.auth.schemas.auth import Login

class CodeToToken(BaseModel):
	code: str
	code_verifier: str
	client_id: str

class CodeToTokenResponse(BaseModel):
	user_id: str
	access: str

class LoginOAuth(Login):
	client_id: str
	redirect_uri: str
	state: str
	code_challenge: str
	code_challenge_method: str

class LoginOAuthResponse(BaseModel):
	code: str


class RefreshOAuth(BaseModel):
	client_id: str

class RefreshResponse(BaseModel):
	user_id: str
	access: str

class LogoutOAuth(BaseModel):
	client_id: str