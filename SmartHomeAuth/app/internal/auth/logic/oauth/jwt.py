import jwt
from datetime import datetime, timedelta
from app.configuration.settings import ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_JWT_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_MINUTES
import secrets

def create_access_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=ACCESS_TOKEN_EXPIRE_MINUTES * 60),
        "type": "access",
    }

    return jwt.encode(payload, SECRET_JWT_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str)->tuple[str, datetime]:
    exp = datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_EXPIRE_MINUTES * 60)
    payload = {
        "sub": user_id,
        "exp": exp,
        "type": "refresh",
    }

    return (jwt.encode(payload, SECRET_JWT_KEY, algorithm=ALGORITHM), exp)

def create_session_token(user_id: str, session_id: str)->tuple[str, datetime]:
    exp = datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_EXPIRE_MINUTES * 60)
    payload = {
        "sub": {"user_id": user_id, "session_id": session_id},
        "exp": exp,
        "type": "session",
        "jti": secrets.token_hex(8),
    }

    return (jwt.encode(payload, SECRET_JWT_KEY, algorithm=ALGORITHM), exp)


def decode_token(token: str):
    return jwt.decode(
        token,
        SECRET_JWT_KEY,
        algorithms=[ALGORITHM],
    )