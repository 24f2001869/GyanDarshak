from datetime import date, datetime
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, EmailStr


# ---------- Auth & users ----------

class UserRole(str, Enum):
    student = "student"
    admin = "admin"


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    role: UserRole


# ---------- Student profile ----------

class StudentProfileOut(BaseModel):
    id: int
    state: Optional[str] = None
    district: Optional[str] = None
    class_level: Optional[str] = None
    stream_interest: Optional[str] = None
    target_field: Optional[str] = None

    class Config:
        from_attributes = True


class StudentWithUser(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    profile: Optional[StudentProfileOut] = None

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    class_level: Optional[str] = None
    stream_interest: Optional[str] = None
    target_field: Optional[str] = None


# ---------- Colleges & courses ----------

class CourseCreate(BaseModel):
    name: str
    level: Optional[str] = None
    duration_years: Optional[float] = None
    approx_fee_total: Optional[float] = None
    stream: Optional[str] = None
    entrance_exam: Optional[str] = None
    discount_available: Optional[bool] = False
    discount_details: Optional[str] = None


class CourseOut(CourseCreate):
    id: int

    class Config:
        from_attributes = True


class CollegeCreate(BaseModel):
    name: str
    state: str
    city: str
    website_url: Optional[str] = None
    is_partner: Optional[bool] = False
    notes: Optional[str] = None
    courses: Optional[List[CourseCreate]] = None


class CollegeOut(BaseModel):
    id: int
    name: str
    state: str
    city: str
    website_url: Optional[str] = None
    is_partner: bool
    notes: Optional[str] = None
    courses: List[CourseOut] = []

    class Config:
        from_attributes = True


# ---------- Exams ----------

class ExamDateCreate(BaseModel):
    year: int
    event_type: str
    date: date


class ExamDateOut(ExamDateCreate):
    id: int

    class Config:
        from_attributes = True


class ExamCreate(BaseModel):
    name: str
    level: Optional[str] = None
    stream: Optional[str] = None
    official_website: Optional[str] = None
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    dates: Optional[List[ExamDateCreate]] = None


class ExamOut(BaseModel):
    id: int
    name: str
    level: Optional[str]
    stream: Optional[str]
    official_website: Optional[str]
    description_en: Optional[str]
    description_hi: Optional[str]
    dates: List[ExamDateOut] = []

    class Config:
        from_attributes = True


# ---------- Scholarships ----------

class ScholarshipCreate(BaseModel):
    name: str
    provider_type: Optional[str] = None
    provider_name: Optional[str] = None
    level: Optional[str] = None
    min_class_or_course: Optional[str] = None
    eligibility_summary_en: Optional[str] = None
    eligibility_summary_hi: Optional[str] = None
    amount_description: Optional[str] = None
    application_url: Optional[str] = None
    state: Optional[str] = None
    last_date: Optional[date] = None


class ScholarshipOut(ScholarshipCreate):
    id: int

    class Config:
        from_attributes = True


# ---------- Tests ----------

class TestQuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A" / "B" / "C" / "D"
    marks: int = 1


class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    questions: List[TestQuestionCreate] = []


class TestQuestionOut(TestQuestionCreate):
    id: int

    class Config:
        from_attributes = True


class TestOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    duration_minutes: int
    total_marks: int
    is_active: bool
    questions: List[TestQuestionOut] = []

    class Config:
        from_attributes = True


class TestStartResponse(BaseModel):
    attempt_id: int
    test: TestOut


class TestAnswerIn(BaseModel):
    question_id: int
    selected_option: str


class TestSubmitRequest(BaseModel):
    answers: List[TestAnswerIn]


class TestResultOut(BaseModel):
    attempt_id: int
    score: int
    total_marks: int


# ---------- Session requests ----------

class SessionRequestCreate(BaseModel):
    preferred_date: date
    preferred_time: Optional[str] = None
    mode: Optional[str] = None
    note: Optional[str] = None


class SessionRequestOut(BaseModel):
    id: int
    preferred_date: date
    preferred_time: Optional[str]
    mode: Optional[str]
    note: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
