from fastapi import APIRouter, Depends, HTTPException, Query , status
from sqlalchemy.orm import Session, joinedload

from app.deps import get_db
from app.security import get_current_user , get_current_admin
from app import models
from app.schemas import CollegeCreate, CollegeOut

router = APIRouter()


def ensure_admin(user: models.User) -> None:
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")


@router.post("/", response_model=CollegeOut)
def create_college(
    payload: CollegeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> CollegeOut:
    ensure_admin(current_user)

    college = models.College(
        name=payload.name,
        state=payload.state,
        city=payload.city,
        website_url=payload.website_url,
        is_partner=payload.is_partner or False,
        notes=payload.notes,
    )
    db.add(college)
    db.flush()  # ensure college.id is available

    if payload.courses:
        for c in payload.courses:
            course = models.Course(
                college_id=college.id,
                name=c.name,
                level=c.level,
                duration_years=c.duration_years,
                approx_fee_total=c.approx_fee_total,
                stream=c.stream,
                entrance_exam=c.entrance_exam,
                discount_available=c.discount_available or False,
                discount_details=c.discount_details,
            )
            db.add(course)

    db.commit()
    db.refresh(college)
    return college


@router.get("/", response_model=list[CollegeOut])
def list_colleges(
    state: str | None = Query(default=None),
    city: str | None = Query(default=None),
    stream: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[CollegeOut]:
    query = db.query(models.College).options(joinedload(models.College.courses))

    if state:
        query = query.filter(models.College.state.ilike(f"%{state}%"))
    if city:
        query = query.filter(models.College.city.ilike(f"%{city}%"))
    if stream:
        query = (
            query.join(models.College.courses)
            .filter(models.Course.stream.ilike(f"%{stream}%"))
        )

    return query.all()


@router.delete("/{college_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_college(
    college_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin),
):
    college = db.query(models.College).filter(models.College.id == college_id).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    db.delete(college)
    db.commit()
    return None