import re

from app.models.dsa_question import DSAQuestion


def validate_dsa(question: DSAQuestion) -> tuple[bool, str]:

    # 1. Title validation
    if not question.title.strip():
        return False, "DSA title is empty."

    # 2. Description validation
    if not question.description.strip():
        return False, "DSA description is empty."

    # 3. Role validation
    if not question.role.strip():
        return False, "DSA role is empty."

    # 4. Difficulty validation
    allowed_difficulties = {"EASY", "MEDIUM", "HARD"}

    if question.difficulty.upper() not in allowed_difficulties:
        return False, "Invalid difficulty."

    # 5. Topics validation
    if not question.topics:
        return False, "DSA problem must contain at least one topic."

    # 6. Constraints validation
    if not question.constraints:
        return False, "DSA problem must contain constraints."

    # 7. Examples validation
    if len(question.examples) < 2:
        return False, "DSA problem must contain at least 2 examples."

    if len(question.examples) > 3:
        return False, "DSA problem cannot contain more than 3 examples."

    for index, example in enumerate(question.examples):

        if not example.input.strip():
            return False, f"Example {index + 1} has empty input."

        if not example.output.strip():
            return False, f"Example {index + 1} has empty output."

        if not example.explanation.strip():
            return False, f"Example {index + 1} has empty explanation."
        
    # 8. Detect solution leakage
    forbidden_phrases = [
        "optimal approach",
        "use a monotonic deque",
        "use two pointers",
        "use sliding window",
        "solution:",
        "algorithm:",
        "time complexity is",
    ]

    description_lower = question.description.lower()

    for phrase in forbidden_phrases:
        if phrase in description_lower:
            return False, (
                f"Problem description contains solution leakage: "
                f"'{phrase}'."
            )

    # 9. Basic starter-code sanity checks
    # if "function " not in question.starter_code_javascript:
    #     return False, "Invalid JavaScript starter code."

    # if "def " not in question.starter_code_python:
    #     return False, "Invalid Python starter code."

    # if "class Main" not in question.starter_code_java:
    #     return False, "Invalid Java starter code."

    return True, ""