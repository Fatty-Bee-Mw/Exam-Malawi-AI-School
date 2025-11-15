from __future__ import annotations

from functools import lru_cache

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .rag_llm import RAGTutor


app = FastAPI(title="Malawian Educational AI Tutor", version="1.0.0")


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str


@lru_cache(maxsize=1)
def get_tutor() -> RAGTutor:
    return RAGTutor()


@app.get("/")
async def root() -> dict:
    return {
        "status": "ok",
        "message": "Malawian Educational AI Tutor API. POST a JSON body to /ask with a 'question' field.",
    }


@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    try:
        tutor = get_tutor()
        answer = tutor.answer_question(question)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return AskResponse(answer=answer)
