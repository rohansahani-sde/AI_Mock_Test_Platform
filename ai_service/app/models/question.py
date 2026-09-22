from pydantic import BaseModel, Field
from typing import List


class MCQQuestion(BaseModel):
    question: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct_answer: int = Field(ge=0, le=3)
    explanation: str
    topic: str
    difficulty: str