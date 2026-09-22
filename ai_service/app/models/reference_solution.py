from pydantic import BaseModel, Field


class ReferenceSolution(BaseModel):
    language: str = Field(
        description="Programming language of the reference solution"
    )

    code: str = Field(
        description="Reference solution code"
    )

    explanation: str = Field(
        description="Explanation of the reference solution"
    )