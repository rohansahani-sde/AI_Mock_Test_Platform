from app.models.question import MCQQuestion


def validate_mcq(question: MCQQuestion) -> tuple[bool, str]:
    # 1. Question must not be empty
    if not question.question.strip():
        return False, "Question is empty."

    # 2. Explanation must not be empty
    if not question.explanation.strip():
        return False, "Explanation is empty."

    # 3. Exactly four options
    if len(question.options) != 4:
        return False, "MCQ must contain exactly 4 options."

    # 4. Options must not be empty
    for option in question.options:
        if not option.strip():
            return False, "MCQ contains an empty option."

    # 5. Options must be unique
    normalized_options = [
        option.strip().lower()
        for option in question.options
    ]

    if len(set(normalized_options)) != 4:
        return False, "MCQ contains duplicate options."

    # 6. Correct answer must point to a valid option
    if not 0 <= question.correct_answer < 4:
        return False, "Invalid correct answer index."

    return True, ""