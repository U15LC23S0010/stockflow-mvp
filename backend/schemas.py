from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    organization_id: int

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sku: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    quantity_on_hand: int = Field(default=0, ge=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    quantity_on_hand: Optional[int] = Field(default=None, ge=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)


class ProductResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    sku: str
    description: Optional[str]
    quantity_on_hand: int
    cost_price: Optional[Decimal]
    selling_price: Optional[Decimal]
    low_stock_threshold: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)