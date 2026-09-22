# from langchain_groq import ChatGroq

# from app.config import LLM_API_KEY
# from app.models.dsa_question import DSAQuestion
# from app.models.test_case import DSATestCase
# from app.prompts.test_case_prompt import TEST_CASE_SYSTEM_PROMPT


# def generate_test_cases(
#     question: DSAQuestion,
#     count: int = 5,
#     max_attempts: int = 20,
# ) -> list[DSATestCase]:

#     llm = ChatGroq(
#         api_key=LLM_API_KEY,
#         model="openai/gpt-oss-120b",
#         temperature=0.2,
#         max_tokens=2000,
#     )

#     structured_llm = llm.with_structured_output(
#         DSATestCase
#     )

#     prompt = f"""
# {TEST_CASE_SYSTEM_PROMPT}

# PROBLEM:

# Title:
# {question.title}

# Description:
# {question.description}

# Input Format:
# {question.input_format}

# Output Format:
# {question.output_format}

# Role:
# {question.role}

# Difficulty:
# {question.difficulty}

# Topics:
# {", ".join(question.topics)}

# Constraints:
# {chr(10).join(question.constraints)}

# Generate ONE hidden test case.

# IMPORTANT:

# The input must follow the exact Input Format.

# The input must satisfy every constraint.

# The input must contain only valid values.

# Do not include markdown.

# Do not include explanations inside the input.

# Do not include expected output.

# Return exactly one structured test case.
# """

#     test_cases = []
#     seen_inputs = set()

#     attempts = 0

#     while len(test_cases) < count and attempts < max_attempts:

#         attempts += 1

#         try:
#             test_case = structured_llm.invoke(prompt)

#             if not test_case.input.strip():
#                 print(
#                     f"Attempt {attempts}: "
#                     "empty test case. Retrying..."
#                 )
#                 continue

#             normalized_input = test_case.input.strip()

#             if normalized_input in seen_inputs:
#                 print(
#                     f"Attempt {attempts}: "
#                     "duplicate test case. Retrying..."
#                 )
#                 continue

#             # The LLM must never provide expected output.
#             test_case.expected_output = None
#             test_case.is_hidden = True

#             test_cases.append(test_case)
#             seen_inputs.add(normalized_input)

#             print(
#                 f"Generated test case "
#                 f"{len(test_cases)}/{count}"
#             )

#         except Exception as error:

#             print(
#                 f"Attempt {attempts} failed:"
#             )
#             print(error)
#             print("Retrying...")

#     if len(test_cases) < count:
#         raise ValueError(
#             f"Could only generate "
#             f"{len(test_cases)}/{count} valid "
#             f"test cases after {attempts} attempts."
#         )

#     return test_cases


import json

from langchain_groq import ChatGroq

from app.config import LLM_API_KEY
from app.models.dsa_question import DSAQuestion
from app.models.test_case import DSATestCase


def extract_json_object(content: str) -> str:
    """
    Extract the first complete JSON object from an LLM response.
    Handles markdown fences and extra text around JSON.
    """

    content = content.strip()

    # Remove markdown code fences if present.
    if "```" in content:
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    # Find the first JSON object.
    start = content.find("{")

    if start == -1:
        raise ValueError(
            "No JSON object found in model response."
        )

    # Track nested braces while respecting strings.
    depth = 0
    inside_string = False
    escape = False

    for index in range(start, len(content)):

        char = content[index]

        if inside_string:

            if escape:
                escape = False

            elif char == "\\":
                escape = True

            elif char == '"':
                inside_string = False

            continue

        if char == '"':
            inside_string = True

        elif char == "{":
            depth += 1

        elif char == "}":
            depth -= 1

            if depth == 0:
                return content[start:index + 1]

    raise ValueError(
        "Incomplete JSON object in model response."
    )

def generate_test_cases(
    question: DSAQuestion,
    count: int = 5,
    max_attempts: int = 10,
) -> list[DSATestCase]:

    llm = ChatGroq(
        api_key=LLM_API_KEY,
        model="openai/gpt-oss-120b",
        temperature=0.2,
        max_tokens=500,
    )

    prompt = f"""
You are an expert competitive programming test-case designer.

Generate ONE valid hidden test case for the programming problem below.

PROBLEM
-------
Title:
{question.title}

Description:
{question.description}

Input Format:
{question.input_format}

Output Format:
{question.output_format}

Difficulty:
{question.difficulty}

Topics:
{", ".join(question.topics)}

Constraints:
{chr(10).join(question.constraints)}

STRICT RULES
------------

1. Generate exactly ONE test case.

2. The input MUST follow the Input Format exactly.

3. The input MUST satisfy every constraint.

4. Generate realistic and useful test data.

5. Prefer edge cases and cases that can expose incorrect solutions.

6. Do NOT generate expected output.

7. Do NOT provide a solution.

8. Do NOT provide algorithm hints.

9. Do NOT use markdown.

10. Return ONLY valid JSON.

The JSON MUST have exactly these fields:

{{
  "input": "complete stdin input",
  "explanation": "short explanation of why this test case is useful"
}}

IMPORTANT:

The value of "input" must be a string.

Do not put JSON outside the object.

Do not use markdown fences.
"""

    test_cases = []
    seen_inputs = set()

    attempts = 0

    while len(test_cases) < count and attempts < max_attempts:

        attempts += 1

        try:

            response = llm.invoke(prompt)

            content = response.content

            if isinstance(content, list):
                content = "".join(
                    item.get("text", "")
                    for item in content
                    if isinstance(item, dict)
                )

            content = str(content).strip()

            
            json_text = extract_json_object(content)
            
            data = json.loads(json_text)


            if not isinstance(data, dict):
                raise ValueError(
                    "LLM response is not a JSON object."
                )

            input_data = data.get("input")
            explanation = data.get("explanation")

            if not isinstance(input_data, str):
                raise ValueError(
                    "Test case input must be a string."
                )

            if not input_data.strip():
                raise ValueError(
                    "Test case input is empty."
                )

            if not isinstance(explanation, str):
                explanation = (
                    "Generated hidden test case."
                )

            normalized_input = input_data.strip()

            if normalized_input in seen_inputs:
                print(
                    f"Attempt {attempts}: "
                    "duplicate test case. Retrying..."
                )
                continue

            test_case = DSATestCase(
                input=normalized_input,
                explanation=explanation.strip(),
                expected_output=None,
                is_hidden=True,
            )

            test_cases.append(test_case)
            seen_inputs.add(normalized_input)

            print(
                f"Generated test case "
                f"{len(test_cases)}/{count}"
            )

        except json.JSONDecodeError as error:
            print(
                f"Attempt {attempts}: "
                "invalid JSON from model."
            )
            print(error)
            print("Retrying...")
            
        except Exception as error:
            error_message = str(error)
            
            if "429" in error_message or "rate_limit_exceeded" in error_message:
                raise RuntimeError(
                    "Groq rate limit reached while generating hidden "
                    "test cases. Please wait for the quota to reset "
                    "before generating more AI test cases."
                    ) from error
            print(
                f"Attempt {attempts} failed:"
            )
            print(error)
            print("Retrying...")

            

            # print(
            #     f"Attempt {attempts} failed:"
            # )
            # print(error)
            # print("Retrying...")

    if len(test_cases) < count:
        raise ValueError(
            f"Could only generate "
            f"{len(test_cases)}/{count} test cases "
            f"after {attempts} attempts."
        )

    return test_cases


