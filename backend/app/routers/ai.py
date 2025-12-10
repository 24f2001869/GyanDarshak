from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str


@router.post("/ask", response_model=AskResponse)
def ask_gyandarshak(payload: AskRequest) -> AskResponse:
    """
    Demo AI endpoint. Later this can call a real LLM and use DB data.
    """
    q = payload.question.strip().lower()

    if "exam" in q:
        text = (
            "This is a demo answer. Gyandarshak will show you relevant exams and "
            "dates based on your class, stream, and state."
        )
    elif "scholarship" in q:
        text = (
            "This is a demo answer. Gyandarshak will highlight scholarships from "
            "government and trusts that match your profile."
        )
    else:
        text = (
            "This is a demo AI assistant. In the next phase, it will use real data "
            "from your profile, colleges, exams, and scholarships."
        )

    return AskResponse(answer=text)
