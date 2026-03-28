import logging
from app.internal.user.models.user import User
from app.internal.role.models.role import Role
from ormar import or_
import base64
import json
from typing import Optional, List, Tuple

logger = logging.getLogger(__name__)

async def get_user(id: str)->User | None:
	try:
		return await User.objects.get_or_none(id=id)
	except Exception as e:
		logger.error(f"error get user: {e}")
		raise
	
async def get_user_by_name(name: str)->User | None:
	try:
		return await User.objects.get_or_none(name=name)
	except Exception as e:
		logger.error(f"error get user: {e}")
		raise
	
async def get_users_by_role(role: Role)->List[User]:
	try:
		return await User.objects.all(role=role)
	except Exception as e:
		logger.error(f"error get user: {e}")
		raise

def encode_cursor(data: dict) -> str:
	return base64.urlsafe_b64encode(json.dumps(data).encode()).decode()

def decode_cursor(cursor: str) -> dict:
	return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())


async def get_all_users(
	search: Optional[str],
	limit: int,
	cursor: Optional[str],
) -> Tuple[List[User], str | None]:
	try:
		query = User.objects.select_related("role").order_by("id")  # 🔥 сразу подтягиваем роль

		# 🔍 Поиск
		if search:
			query = query.filter(
				or_(
					User.name.icontains(search),
					User.email.icontains(search),
				)
			)
		
		total = await query.count()

		if cursor:
			data = decode_cursor(cursor)
			query = query.filter(User.id > data["id"])

		users = await query.limit(limit).all()

		next_cursor = (
			encode_cursor({"id": users[-1].id})
			if len(users) == limit
			else None
		)

		return users, next_cursor, total

	except Exception as e:
		logger.error(f"error get all users: {e}")
		raise

async def get_all_users_page(
	page: int = 1,
	limit: int = 20,
	search: Optional[str] = None,
):
	"""
	Возвращает пользователей для конкретной страницы (offset-based).
	"""
	try:
		query = User.objects.select_related("role").order_by("id")

		# Поиск
		if search:
			query = query.filter(
				or_(
					User.name.icontains(search),
					User.email.icontains(search),
				)
			)

		total = await query.count()
		offset = (page - 1) * limit
		print(offset, page)

		users = await query.offset(offset).limit(limit).all()

		return users, offset, total

		# users_data = []
		# for user in users:
		#     await user.role.load()
		#     users_data.append(
		#         UserSchema(
		#             id=user.id,
		#             name=user.name,
		#             email=user.email,
		#             role=user.role.role_name,
		#         )
		#     )

		# return UsersDataSchema(users=users_data, total=total)

	except Exception as e:
		logger.error(f"error get all users: {e}")
		raise