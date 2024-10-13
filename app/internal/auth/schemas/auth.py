import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class Login(BaseModel):
	name: str
	password: str
	
