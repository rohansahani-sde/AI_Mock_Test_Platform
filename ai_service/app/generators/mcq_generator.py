from langchain_groq import ChatGroq

from app.config import (
    LLM_API_KEY,
    LLM_MODEL,
)

from app.models.question import MCQQuestion
from app.prompts.mcq_prompt import MCQ_SYSTEM_PROMPT
from app.validators.mcq_validator import validate_mcq


def create_llm():
    return ChatGroq(
        model=LLM_MODEL,
        api_key=LLM_API_KEY,
        temperature=0.4,
        max_tokens=800,
    )


def generate_mcq(
    role: str,
    difficulty: str,
    topic: str,
):
    llm = create_llm()

    structured_llm = llm.with_structured_output(MCQQuestion)

    prompt = f"""
{MCQ_SYSTEM_PROMPT}

Generate exactly one MCQ using these requirements:

Role: {role}
Difficulty: {difficulty}
Topic: {topic}

Make the question appropriate for a technical recruitment mock test.

Requirements:
- Generate exactly 4 options.
- Only one option must be correct.
- correct_answer must be the zero-based index of the correct option.
- Do not generate duplicate options.
- Provide a clear explanation.
"""

    max_attempts = 3

    for attempt in range(max_attempts):
        result = structured_llm.invoke(prompt)

        is_valid, error_message = validate_mcq(result)

        if is_valid:
            return result

        print(
            f"MCQ validation failed "
            f"(attempt {attempt + 1}/{max_attempts}): "
            f"{error_message}"
        )

        prompt = f"""
{MCQ_SYSTEM_PROMPT}

Generate a new MCQ.

Role: {role}
Difficulty: {difficulty}
Topic: {topic}

The previous generated question failed validation.

Validation error:
{error_message}

Generate a completely new question.

Requirements:
- Exactly 4 unique options.
- Only one correct answer.
- correct_answer must be a zero-based index from 0 to 3.
- Provide a clear explanation.
"""

    raise ValueError(
        "Failed to generate a valid MCQ after 3 attempts."
    )