import ormar, datetime
from app.pkg.ormar.dbormar import base_ormar_config
from typing import Optional
from app.internal.user.models.user import User
from ormar import ReferentialAction
from app.internal.auth.schemas.enums import TypeSession

class Session(ormar.Model):
	ormar_config = base_ormar_config.copy(
		constraints = [ormar.UniqueColumns("access", "refresh")]
	)

	id: str = ormar.String(max_length=100, primary_key=True)
	user: Optional[User] = ormar.ForeignKey(User, ondelete=ReferentialAction.CASCADE)
	service: str = ormar.String(max_length=100, nullable=True)
	access: Optional[str] = ormar.Text(max_length=512, nullable=True)
	refresh: Optional[str] = ormar.Text(max_length=512, nullable=True)
	expires_at: datetime.datetime = ormar.DateTime()
	host: str = ormar.Text(max_length=200, nullable=True)
	ip: str = ormar.String(max_length=100, nullable=True)
	type: TypeSession = ormar.String(max_length=20, nullable=False)

	def __str__(self):
		return self.id

class Client(ormar.Model):
	ormar_config = base_ormar_config.copy()

	id: str = ormar.String(max_length=100, primary_key=True)
	name: str = ormar.String(max_length=100)
	redirect_uri: str = ormar.String(max_length=200)

	def __str__(self):
		return self.id

class AuthorizenCode(ormar.Model):
	ormar_config = base_ormar_config.copy()

	id: str = ormar.String(max_length=100, primary_key=True)
	code: str = ormar.String(max_length=512)
	redirect_uri: str = ormar.String(max_length=200)
	code_challenge: str = ormar.String(max_length=100)
	user: Optional[User] = ormar.ForeignKey(User, ondelete=ReferentialAction.CASCADE)
	client: Optional[Client] = ormar.ForeignKey(Client, ondelete=ReferentialAction.CASCADE)
	session: Session = ormar.ForeignKey(Session, ondelete=ReferentialAction.CASCADE)
	expires_at: datetime.datetime = ormar.DateTime()

	def __str__(self):
		return self.id

class RefreshData(ormar.Model):
	ormar_config = base_ormar_config.copy()

	id: str = ormar.String(max_length=100, primary_key=True)
	token: str = ormar.String(max_length=512)
	user: User = ormar.ForeignKey(User, ondelete=ReferentialAction.CASCADE)
	client: Client = ormar.ForeignKey(Client, ondelete=ReferentialAction.CASCADE)
	session: Session = ormar.ForeignKey(Session, ondelete=ReferentialAction.CASCADE)
	expires_at: datetime.datetime = ormar.DateTime()

	def __str__(self):
		return self.id
