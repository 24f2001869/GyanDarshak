from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models
from app.schemas import UserCreate, UserOut, Token
from app.deps import get_db
from app.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    existing = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=models.UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # create empty profile for the new user
    profile = models.StudentProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    user = (
        db.query(models.User)
        .filter(models.User.email == form_data.username)
        .first()
    )
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token)
