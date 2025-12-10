from fastapi import APIRouter, Depends, HTTPException, Query , status
from sqlalchemy.orm import Session

from app.deps import get_db
from app.security import get_current_user , get_current_admin
from app import models
from app.schemas import ScholarshipCreate, ScholarshipOut

router = APIRouter()


def ensure_admin(user: models.User) -> None:
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")


@router.post("/", response_model=ScholarshipOut)
def create_scholarship(
    payload: ScholarshipCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> ScholarshipOut:
    ensure_admin(current_user)

    sch = models.Scholarship(
        name=payload.name,
        provider_type=payload.provider_type,
        provider_name=payload.provider_name,
        level=payload.level,
        min_class_or_course=payload.min_class_or_course,
        eligibility_summary_en=payload.eligibility_summary_en,
        eligibility_summary_hi=payload.eligibility_summary_hi,
        amount_description=payload.amount_description,
        application_url=payload.application_url,
        state=payload.state,
        last_date=payload.last_date,
    )
    db.add(sch)
    db.commit()
    db.refresh(sch)
    return sch


@router.get("/", response_model=list[ScholarshipOut])
def list_scholarships(
    level: str | None = Query(default=None),
    state: str | None = Query(default=None),
    provider_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ScholarshipOut]:
    query = db.query(models.Scholarship)

    if level:
        query = query.filter(models.Scholarship.level.ilike(f"%{level}%"))
    if state:
        query = query.filter(models.Scholarship.state.ilike(f"%{state}%"))
    if provider_type:
        query = query.filter(
            models.Scholarship.provider_type.ilike(f"%{provider_type}%")
        )

    return (
        query.order_by(
            models.Scholarship.last_date.is_(None),
            models.Scholarship.last_date,
        ).all()
    )



@router.delete("/{scholarship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    s = (
        db.query(models.Scholarship)
        .filter(models.Scholarship.id == scholarship_id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    db.delete(s)
    db.commit()
    return None