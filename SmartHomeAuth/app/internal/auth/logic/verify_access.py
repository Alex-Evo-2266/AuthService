import jwt
from datetime import datetime
from app.configuration import settings
from app.internal.auth.models.auth import Session
from app.internal.auth.exceptions.access import AccessExpired, InvalidAccess
from app.internal.auth.logic.refresh import refresh_session
from fastapi import Response

async def verify_access_token(access_token: str):
    """
    Проверяет access JWT и связанную сессию.

    Возвращает:
        Session — если всё валидно

    Исключения:
        AccessExpired
        InvalidAccess
    """
    try:
        payload = jwt.decode(
            access_token,
            settings.SECRET_JWT_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise AccessExpired()
    except jwt.InvalidTokenError:
        raise InvalidAccess()

    if payload.get("sub") != "access":
        raise InvalidAccess()

    session = await Session.objects.get_or_none(access=access_token)
    if not session:
        raise InvalidAccess()

    await session.user.load()
    await session.user.role.load()

    return session


async def verify_or_refresh_session(
    access: str,
    refresh: str | None,
    response: Response,
) -> Session:

    try:
        return await verify_access_token(access)

    except AccessExpired:
        if not refresh:
            raise InvalidAccess()

        session = await refresh_session(refresh)

        response.set_cookie(
            "smart_home_access_sso",
            session.access,
            httponly=True,
            secure=True,
            samesite="none",
        )
        response.set_cookie(
            "smart_home_refrash_sso",
            session.refresh,
            httponly=True,
            secure=True,
            samesite="none",
        )

        return session
