import enum
from datetime import datetime, date

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)

    student_profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
    )


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    class_level = Column(String, nullable=True)
    stream_interest = Column(String, nullable=True)
    target_field = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")


class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False, index=True)
    website_url = Column(String, nullable=True)
    is_partner = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    courses = relationship(
        "Course",
        back_populates="college",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(String, nullable=True)  # UG / PG / Diploma
    duration_years = Column(Float, nullable=True)
    approx_fee_total = Column(Float, nullable=True)
    stream = Column(String, nullable=True)  # engineering / medical / etc.
    entrance_exam = Column(String, nullable=True)
    discount_available = Column(Boolean, default=False)
    discount_details = Column(Text, nullable=True)

    college = relationship("College", back_populates="courses")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    level = Column(String, nullable=True)   # national / state / college
    stream = Column(String, nullable=True)  # engineering / medical / law / etc.
    official_website = Column(String, nullable=True)
    description_en = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)

    dates = relationship(
        "ExamDate",
        back_populates="exam",
        cascade="all, delete",
    )


class ExamDate(Base):
    __tablename__ = "exam_dates"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    year = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)  # application_start, exam_date, result_date...
    date = Column(Date, nullable=False)

    exam = relationship("Exam", back_populates="dates")


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    provider_type = Column(String, nullable=True)  # government / trust / private
    provider_name = Column(String, nullable=True)
    level = Column(String, nullable=True)          # school / UG / PG
    min_class_or_course = Column(String, nullable=True)
    eligibility_summary_en = Column(Text, nullable=True)
    eligibility_summary_hi = Column(Text, nullable=True)
    amount_description = Column(Text, nullable=True)
    application_url = Column(String, nullable=True)
    state = Column(String, nullable=True)          # if state-specific
    last_date = Column(Date, nullable=True)

    statuses = relationship(
        "StudentScholarshipStatus",
        back_populates="scholarship",
        cascade="all, delete",
    )


class StudentScholarshipStatus(Base):
    __tablename__ = "student_scholarship_status"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id"), nullable=False)
    status = Column(String, nullable=False, default="interested")  # interested/applied/approved/rejected
    notes = Column(Text, nullable=True)

    scholarship = relationship("Scholarship", back_populates="statuses")
    student = relationship("StudentProfile")


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    total_marks = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    questions = relationship(
        "TestQuestion",
        back_populates="test",
        cascade="all, delete-orphan",
    )
    attempts = relationship(
        "TestAttempt",
        back_populates="test",
        cascade="all, delete-orphan",
    )


class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)  # "A" / "B" / "C" / "D"
    marks = Column(Integer, nullable=False, default=1)

    test = relationship("Test", back_populates="questions")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)

    test = relationship("Test", back_populates="attempts")
    student = relationship("StudentProfile")
    answers = relationship(
        "TestAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )


class TestAnswer(Base):
    __tablename__ = "test_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("test_questions.id"), nullable=False)
    selected_option = Column(String, nullable=False)  # "A" / "B" / "C" / "D"

    attempt = relationship("TestAttempt", back_populates="answers")
    question = relationship("TestQuestion")


class SessionRequest(Base):
    __tablename__ = "session_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    preferred_date = Column(Date, nullable=False)
    preferred_time = Column(String, nullable=True)  # e.g. "Morning", "Afternoon", "Evening"
    mode = Column(String, nullable=True)           # "online" / "offline"
    note = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending/approved/rejected/done
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    student = relationship("StudentProfile")
