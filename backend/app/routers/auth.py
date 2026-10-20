from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import User, BusinessProfile
from ..schemas.dtos import LoginRequest, Token, UserProfile, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{current_user.role}' is not in allowed roles {allowed_roles}",
            )
        return current_user
    return role_checker

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        demo_roles = {
            settings.DEMO_EMAIL: ("Nimal Perera", "Manager"),
            "admin@foodsense.lk": ("Dr. Samantha Wickramasinghe", "Admin"),
            "staff@foodsense.lk": ("Kasun Jayawardena", "Kitchen Staff"),
        }
        if request.email in demo_roles and request.password == settings.DEMO_PASSWORD:
            name, role = demo_roles[request.email]
            user = User(
                email=request.email,
                hashed_password=pwd_context.hash(settings.DEMO_PASSWORD),
                full_name=name,
                role=role,
            )
            db.add(user)
            db.flush()
            db.add(BusinessProfile(
                user_id=user.id,
                business_name="Colombo Gourmet Kitchen & Market",
                business_type="Restaurant",
                currency="LKR",
            ))
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    elif not pwd_context.verify(request.password, user.hashed_password):
        if request.password != settings.DEMO_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    b_type = profile.business_type if profile else "Restaurant"
    currency = profile.currency if profile else settings.DEFAULT_CURRENCY

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_name=user.full_name,
        email=user.email,
        business_type=b_type,
        currency=currency,
        role=user.role,
    )

@router.get("/me", response_model=UserProfile)
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    return UserProfile(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        business_name=profile.business_name if profile else "FoodSense Partner",
        business_type=profile.business_type if profile else "Restaurant",
        currency=profile.currency if profile else settings.DEFAULT_CURRENCY,
        outlet_name=profile.outlet_name if profile else "Main Outlet",
        address=profile.address if profile else "Colombo, Sri Lanka",
    )

@router.put("/profile", response_model=UserProfile)
def update_profile(
    req: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=user.id)
        db.add(profile)

    if req.business_name is not None:
        profile.business_name = req.business_name
    if req.business_type is not None:
        profile.business_type = req.business_type
    if req.currency is not None:
        profile.currency = req.currency
    if req.outlet_name is not None:
        profile.outlet_name = req.outlet_name
    if req.address is not None:
        profile.address = req.address

    db.commit()
    db.refresh(profile)

    return UserProfile(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        business_name=profile.business_name,
        business_type=profile.business_type,
        currency=profile.currency,
        outlet_name=profile.outlet_name,
        address=profile.address,
    )
