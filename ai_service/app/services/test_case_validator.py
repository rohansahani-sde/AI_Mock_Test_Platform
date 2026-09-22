import re

from app.models.dsa_question import DSAQuestion
from app.models.test_case import DSATestCase


def validate_test_case(
    question: DSAQuestion,
    test_case: DSATestCase,
) -> tuple[bool, str]:

    raw_input = test_case.input.strip()

    if not raw_input:
        return False, "Test case input is empty."

    if test_case.expected_output is not None:
        return False, (
            "Generated test case must not contain "
            "an expected output."
        )

    tokens = raw_input.split()

    if not tokens:
        return False, "No input tokens found."

    # Most generated assessment problems use N as
    # the first input value. Validate it when possible.
    try:
        n = int(tokens[0])
    except ValueError:
        return True, "Input format requires custom validation."

    if n <= 0:
        return False, "N must be positive."

    # Detect whether the problem uses an array of N values.
    description = (
        question.description
        + " "
        + question.input_format
    ).lower()

    array_indicators = [
        "n integers",
        "n elements",
        "array",
        "elements of a",
    ]

    uses_array = any(
        indicator in description
        for indicator in array_indicators
    )

    if uses_array:

        # Search for a likely statement that N array
        # values are expected.
        if len(tokens) < n + 1:
            return False, (
                f"Expected at least {n} array values "
                f"after N, but only "
                f"{len(tokens) - 1} were provided."
            )

    # Basic integer-token validation.
    for token in tokens:
        try:
            int(token)
        except ValueError:
            return False, (
                f"Invalid input token: {token}"
            )

    return True, "Test case is valid."

# from app.models.dsa_question import DSAQuestion
# from app.models.test_case import DSATestCase


# def validate_test_case(
#     question: DSAQuestion,
#     test_case: DSATestCase,
# ) -> tuple[bool, str]:

#     if not test_case.input.strip():
#         return False, "Test case input is empty."

#     if not test_case.input.strip():
#         return False, "Test case contains no input."

#     # Expected output must not come from the LLM.
#     if test_case.expected_output is not None:
#         return False, (
#             "Generated test case must not contain "
#             "an expected output."
#         )

#     return True, "Test case is structurally valid."