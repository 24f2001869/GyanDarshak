from fastapi import APIRouter, Depends, HTTPException, Query , status
from sqlalchemy.orm import Session, joinedload

from app.deps import get_db
from app.security import get_current_user , get_current_admin
from app import models
from app.schemas import ExamCreate, ExamOut

router = APIRouter()


def ensure_admin(user: models.User) -> None:
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")


@router.post("/", response_model=ExamOut)
def create_exam(
    payload: ExamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ExamOut:
    ensure_admin(current_user)

    exam = models.Exam(
        name=payload.name,
        level=payload.level,
        stream=payload.stream,
        official_website=payload.official_website,
        description_en=payload.description_en,
        description_hi=payload.description_hi,
    )
    db.add(exam)
    db.flush()  # exam.id available

    if payload.dates:
        for d in payload.dates:
            db.add(
                models.ExamDate(
                    exam_id=exam.id,
                    year=d.year,
                    event_type=d.event_type,
                    date=d.date,
                )
            )

    db.commit()
    db.refresh(exam)
    return exam


@router.get("/", response_model=list[ExamOut])
def list_exams(
    year: int | None = Query(default=None),
    stream: str | None = Query(default=None),
    level: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ExamOut]:
    query = db.query(models.Exam).options(joinedload(models.Exam.dates))

    if stream:
        query = query.filter(models.Exam.stream.ilike(f"%{stream}%"))
    if level:
        query = query.filter(models.Exam.level.ilike(f"%{level}%"))
    if year:
        query = (
            query.join(models.Exam.dates)
            .filter(models.ExamDate.year == year)
        )

    return query.all()


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    db.delete(exam)
    db.commit()
    return None