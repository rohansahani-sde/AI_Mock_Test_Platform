from langchain_groq import ChatGroq

from app.config import (
    LLM_API_KEY,
    LLM_MODEL,
)

from app.models.dsa_question import DSAQuestion
from app.prompts.dsa_prompt import DSA_SYSTEM_PROMPT
from app.validators.dsa_validator import validate_dsa


def create_llm():
    return ChatGroq(
        model=LLM_MODEL,
        api_key=LLM_API_KEY,
        temperature=0.5,
        max_tokens=2000,
    )


def generate_dsa(
    role: str,
    difficulty: str,
    topic: str,
):
    llm = create_llm()

    structured_llm = llm.with_structured_output(DSAQuestion)

    prompt = f"""
{DSA_SYSTEM_PROMPT}

Generate one DSA problem using these requirements:

Role: {role}
Difficulty: {difficulty}
Topic: {topic}

The problem must be suitable for a technical recruitment
mock assessment.
"""

    max_attempts = 3

    for attempt in range(max_attempts):

        result = structured_llm.invoke(prompt)

        is_valid, error_message = validate_dsa(result)

        if is_valid:
            return result

        print(
            f"DSA validation failed "
            f"(attempt {attempt + 1}/{max_attempts}): "
            f"{error_message}"
        )
        prompt = f"""
{DSA_SYSTEM_PROMPT}

Generate a DSA problem with the following requirements:

Role:
{role}

Difficulty:
{difficulty}

Topic:
{topic}

The input format must be explicitly defined.

The output format must be explicitly defined.

The examples must exactly follow the input and output formats.

Return only the structured DSA question.
"""

#         prompt = f"""
# {DSA_SYSTEM_PROMPT}

# Generate a completely new DSA problem.

# Role: {role}
# Difficulty: {difficulty}
# Topic: {topic}

# The previous generated problem failed validation.

# Validation error:
# {error_message}

# Do not repeat the previous problem.

# Make sure:
# - The description is complete.
# - There are 2 or 3 examples.
# - Examples have valid input and output.
# - Constraints are realistic.
# - JavaScript starter code is valid.
# - Python starter code is valid.
# - Java starter code is valid.
# - Do not reveal the solution or optimal algorithm.
# """

    raise ValueError(
        "Failed to generate a valid DSA problem after 3 attempts."
    )