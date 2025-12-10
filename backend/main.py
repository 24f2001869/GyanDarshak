from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, students, colleges , exams, scholarships , ai, tests , session_requests
from app.database import Base, engine

app = FastAPI(title="Gyandarshak API")

# Allow React dev server
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(colleges.router, prefix="/colleges", tags=["colleges"])
app.include_router(exams.router, prefix="/exams", tags=["exams"])
app.include_router(scholarships.router, prefix="/scholarships", tags=["scholarships"])
app.include_router(tests.router, prefix="/tests", tags=["tests"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(session_requests.router, prefix="/sessions", tags=["sessions"])

@app.get("/")
def read_root():
    return {"message": "Gyandarshak API is running"}
