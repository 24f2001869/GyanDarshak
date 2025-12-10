from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.deps import get_db
from app.security import get_current_user
from app import models
from app.schemas import (
    TestCreate,
    TestOut,
    TestStartResponse,
    TestSubmitRequest,
    TestResultOut,
)

router = APIRouter()


def ensure_admin(user: models.User) -> None:
    if user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Admins only")


# ---- Admin endpoints ----

@router.post("/", response_model=TestOut)
def create_test(
    payload: TestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> TestOut:
    ensure_admin(current_user)

    test = models.Test(
        title=payload.title,
        description=payload.description,
        duration_minutes=payload.duration_minutes,
        total_marks=0,
        is_active=True,
    )
    db.add(test)
    db.flush()  # get test.id

    total_marks = 0
    for q in payload.questions:
        question = models.TestQuestion(
            test_id=test.id,
            text=q.text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option.upper(),
            marks=q.marks,
        )
        total_marks += q.marks
        db.add(question)

    test.total_marks = total_marks
    db.commit()
    db.refresh(test)
    return test


@router.get("/", response_model=list[TestOut])
def list_tests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[TestOut]:
    # both admin and students can see active tests
    return db.query(models.Test).filter(models.Test.is_active.is_(True)).all()


# ---- Student endpoints ----

@router.post("/{test_id}/start", response_model=TestStartResponse)
def start_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> TestStartResponse:
    # find student profile
    student = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    test = (
        db.query(models.Test)
        .filter(models.Test.id == test_id, models.Test.is_active.is_(True))
        .first()
    )
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    attempt = models.TestAttempt(
        test_id=test.id,
        student_id=student.id,
        started_at=datetime.utcnow(),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return TestStartResponse(attempt_id=attempt.id, test=test)


@router.post("/attempts/{attempt_id}/submit", response_model=TestResultOut)
def submit_test(
    attempt_id: int,
    payload: TestSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> TestResultOut:
    attempt = (
        db.query(models.TestAttempt)
        .filter(models.TestAttempt.id == attempt_id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    # ensure attempt belongs to current student
    student = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not student or attempt.student_id != student.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    test = (
        db.query(models.Test)
        .filter(models.Test.id == attempt.test_id)
        .first()
    )
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # clear previous answers if any
    db.query(models.TestAnswer).filter(
        models.TestAnswer.attempt_id == attempt.id
    ).delete()

    # score
    questions_by_id = {q.id: q for q in test.questions}
    score = 0

    for ans in payload.answers:
        q = questions_by_id.get(ans.question_id)
        if not q:
            continue
        selected = ans.selected_option.upper()
        db.add(
            models.TestAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option=selected,
            )
        )
        if selected == q.correct_option:
            score += q.marks

    attempt.score = score
    attempt.finished_at = datetime.utcnow()
    db.commit()
    db.refresh(attempt)

    return TestResultOut(
        attempt_id=attempt.id,
        score=score,
        total_marks=test.total_marks,
    )


# ---- Attempt summaries ----

class AttemptSummary(BaseModel):
    attempt_id: int
    test_id: int
    test_title: str
    score: int | None
    total_marks: int
    started_at: datetime
    finished_at: datetime | None


@router.get("/my-attempts", response_model=List[AttemptSummary])
def list_my_attempts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[AttemptSummary]:
    student = (
        db.query(models.StudentProfile)
        .filter(models.StudentProfile.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=400, detail="Student profile not found")

    attempts = (
        db.query(models.TestAttempt)
        .join(models.Test, models.Test.id == models.TestAttempt.test_id)
        .filter(models.TestAttempt.student_id == student.id)
        .order_by(models.TestAttempt.started_at.desc())
        .all()
    )

    items: list[AttemptSummary] = []
    for a in attempts:
        items.append(
            AttemptSummary(
                attempt_id=a.id,
                test_id=a.test.id,
                test_title=a.test.title,
                score=a.score,
                total_marks=a.test.total_marks,
                started_at=a.started_at,
                finished_at=a.finished_at,
            )
        )
    return items


class AttemptAdminSummary(BaseModel):
    attempt_id: int
    student_name: str | None
    score: int | None
    total_marks: int
    started_at: datetime
    finished_at: datetime | None


@router.get("/{test_id}/attempts", response_model=List[AttemptAdminSummary])
def list_test_attempts_admin(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[AttemptAdminSummary]:
    ensure_admin(current_user)

    test = db.query(models.Test).filter(models.Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    attempts = (
        db.query(models.TestAttempt)
        .join(
            models.StudentProfile,
            models.StudentProfile.id == models.TestAttempt.student_id,
        )
        .filter(models.TestAttempt.test_id == test_id)
        .order_by(models.TestAttempt.started_at.desc())
        .all()
    )

    items: list[AttemptAdminSummary] = []
    for a in attempts:
        student_name = getattr(a.student, "full_name", None)
        items.append(
            AttemptAdminSummary(
                attempt_id=a.id,
                student_name=student_name,
                score=a.score,
                total_marks=test.total_marks,
                started_at=a.started_at,
                finished_at=a.finished_at,
            )
        )
    return items
