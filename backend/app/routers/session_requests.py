from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.security import get_current_user
from app import models
from app.schemas import SessionRequestCreate, SessionRequestOut

router = APIRouter()


def ensure_admin(user: models.User) -> None:
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")


@router.post("/", response_model=SessionRequestOut)
def create_request(
    payload: SessionRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> SessionRequestOut:
    student = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    if payload.preferred_date < date.today():
        raise HTTPException(status_code=400, detail="Date must be in the future")

    req = models.SessionRequest(
        student_id=student.id,
        preferred_date=payload.preferred_date,
        preferred_time=payload.preferred_time,
        mode=payload.mode,
        note=payload.note,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/mine", response_model=list[SessionRequestOut])
def my_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[SessionRequestOut]:
    student = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    return (
        db.query(models.SessionRequest)
        .filter(models.SessionRequest.student_id == student.id)
        .order_by(models.SessionRequest.created_at.desc())
        .all()
    )


@router.get("/", response_model=list[SessionRequestOut])
def list_all_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[SessionRequestOut]:
    ensure_admin(current_user)
    return (
        db.query(models.SessionRequest)
        .order_by(models.SessionRequest.created_at.desc())
        .all()
    )


@router.post("/{request_id}/status", response_model=SessionRequestOut)
def update_status(
    request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> SessionRequestOut:
    ensure_admin(current_user)

    req = (
        db.query(models.SessionRequest)
        .filter(models.SessionRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if status not in {"pending", "approved", "rejected", "done"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    req.status = status
    db.commit()
    db.refresh(req)
    return req
