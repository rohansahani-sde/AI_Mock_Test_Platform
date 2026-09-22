# from langchain_groq import ChatGroq

# from app.config import (
#     LLM_API_KEY,
#     LLM_MODEL,
# )

# from app.models.dsa_question import DSAQuestion
# from app.models.reference_solution import ReferenceSolution
# from app.prompts.reference_solution_prompt import (
#     REFERENCE_SOLUTION_SYSTEM_PROMPT,
# )


# def create_llm():
#     return ChatGroq(
#         model=LLM_MODEL,
#         api_key=LLM_API_KEY,
#         temperature=0.1,
#         max_tokens=3000,
#     )


# def generate_reference_solution(
#     question: DSAQuestion,
# ):

#     llm = create_llm()

#     structured_llm = llm.with_structured_output(
#         ReferenceSolution
#     )

#     prompt = f"""
# {REFERENCE_SOLUTION_SYSTEM_PROMPT}

# Generate the internal Python reference solution
# for the following problem.

# Problem title:
# {question.title}

# Problem description:
# {question.description}

# Role:
# {question.role}

# Difficulty:
# {question.difficulty}

# Topics:
# {question.topics}

# Constraints:
# {question.constraints}

# Examples:
# {question.examples}

# IMPORTANT:

# Return the actual reference solution.

# The "code" field must contain complete executable
# Python code.

# Do NOT return the JSON schema.

# Do NOT return field definitions.

# Do NOT return metadata instead of the solution.
# """

#     result = structured_llm.invoke(prompt)

#     return result

from langchain_groq import ChatGroq

from app.config import (
    LLM_API_KEY,
    LLM_MODEL,
)

from app.models.dsa_question import DSAQuestion
from app.models.reference_solution import ReferenceSolution
from app.prompts.reference_solution_prompt import (
    REFERENCE_SOLUTION_SYSTEM_PROMPT,
)


def create_llm():
    return ChatGroq(
        model=LLM_MODEL,
        api_key=LLM_API_KEY,
        temperature=0.1,
        max_tokens=3000,
    )

def normalize_code(code: str) -> str:
    """
    Convert escaped newline sequences returned by an LLM
    into actual newlines.
    """
    code = code.strip()

    if "\\n" in code:
        code = code.replace("\\r\\n", "\n")
        code = code.replace("\\n", "\n")
        code = code.replace("\\t", "\t")

    return code



def generate_reference_solution(
    question: DSAQuestion,
):
    llm = create_llm()

    structured_llm = llm.with_structured_output(
        ReferenceSolution,
        method="json_schema",
    )

    prompt = f"""
{REFERENCE_SOLUTION_SYSTEM_PROMPT}

Problem title:
{question.title}

Problem description:
{question.description}

Input Format:
{question.input_format}

Output Format:
{question.output_format}

Constraints:
{question.constraints}

Examples:
{question.examples}
"""

    result = structured_llm.invoke(prompt)
    result.code = normalize_code(result.code)

    return result


# from langchain_groq import ChatGroq

# from app.config import GROQ_API_KEY
# from app.models.dsa_question import DSAQuestion
# from app.models.reference_solution import ReferenceSolution
# from app.prompts.reference_solution_prompt import (
#     REFERENCE_SOLUTION_SYSTEM_PROMPT,
# )
# from app.services.reference_verification_service import (
#     verify_reference_solution,
# )


# def generate_reference_solution(
#     question: DSAQuestion,
#     max_attempts: int = 3,
# ) -> ReferenceSolution:

#     llm = ChatGroq(
#         api_key=GROQ_API_KEY,
#         model="llama-3.3-70b-versatile",
#         temperature=0.1,
#         max_tokens=4000,
#     )

#     structured_llm = llm.with_structured_output(
#         ReferenceSolution
#     )

#     prompt = f"""
# {REFERENCE_SOLUTION_SYSTEM_PROMPT}

# PROBLEM:

# Title:
# {question.title}

# Description:
# {question.description}

# Role:
# {question.role}

# Difficulty:
# {question.difficulty}

# Topics:
# {", ".join(question.topics)}

# Constraints:
# {chr(10).join(question.constraints)}

# Examples:
# """

#     for index, example in enumerate(question.examples, start=1):
#         prompt += f"""
# Example {index}

# Input:
# {example.input}

# Output:
# {example.output}

# Explanation:
# {example.explanation}

# """

#     prompt += """
# Generate the complete internal Python reference solution now.
# """

#     last_error = None

#     for attempt in range(1, max_attempts + 1):

#         try:
#             reference = structured_llm.invoke(prompt)

#             if reference.language.strip().lower() != "python":
#                 raise ValueError(
#                     "Reference solution language must be Python."
#                 )

#             if not reference.code.strip():
#                 raise ValueError(
#                     "Reference solution code is empty."
#                 )

#             valid, message = verify_reference_solution(
#                 question=question,
#                 reference_solution=reference,
#             )

#             if valid:
#                 print(
#                     f"Reference solution verified "
#                     f"on attempt {attempt}."
#                 )

#                 return reference

#             last_error = message

#             print(
#                 f"Reference solution verification failed "
#                 f"on attempt {attempt}:"
#             )
#             print(message)

#             prompt += f"""

# The previous reference solution failed verification.

# Verification result:
# {message}

# Generate a corrected reference solution.
# Make sure the new solution follows the exact
# problem statement and passes every public example.
# """

#         except Exception as error:

#             last_error = str(error)

#             print(
#                 f"Reference solution generation failed "
#                 f"on attempt {attempt}:"
#             )
#             print(error)

#     raise ValueError(
#         "Unable to generate a verified reference solution "
#         f"after {max_attempts} attempts.\n"
#         f"Last error: {last_error}"
#     )