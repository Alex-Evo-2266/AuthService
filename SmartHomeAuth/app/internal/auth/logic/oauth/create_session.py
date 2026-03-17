
from app.internal.user.models.user import User
from uuid import uuid4
from app.internal.user.exceptions.user import UserNotFoundException

from app.internal.auth.logic.oauth.jwt import create_session_token
from app.internal.auth.models.auth import Session

from app.internal.auth.schemas.enums import TypeSession





async def create_session(user: User, host: str | None, ip: str | None)->Session:
	uuid = uuid4().hex
	(token, exp) = create_session_token(user.id, uuid)
	if not user:
		raise UserNotFoundException()
	session = await Session.objects.create(
		id=uuid,
		user=user, 
		expires_at=exp,
		access=token,
		host=host,
		type=TypeSession.OAUTH
		)
	return session