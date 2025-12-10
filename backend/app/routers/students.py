from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.security import get_current_user
from app import models
from app.schemas import StudentWithUser, StudentProfileOut, StudentProfileUpdate

router = APIRouter()


@router.get("/ping")
def students_ping():
    return {"message": "students ok"}


@router.get("/me", response_model=StudentWithUser)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "profile": profile,
    }


@router.patch("/me", response_model=StudentWithUser)
def update_my_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found")

    # optionally update name
    if payload.full_name is not None and payload.full_name.strip():
        current_user.full_name = payload.full_name.strip()

    # update profile fields if provided
    for field in ["state", "district", "class_level", "stream_interest", "target_field"]:
        val = getattr(payload, field)
        if val is not None:
            setattr(profile, field, val.strip() or None)

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "profile": profile,
    }
