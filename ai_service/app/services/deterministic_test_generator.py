from app.models.dsa_question import DSAQuestion
from app.models.test_case import DSATestCase


def generate_basic_test_cases(
    question: DSAQuestion,
    count: int = 5,
) -> list[DSATestCase]:

    """
    Generate deterministic test cases.

    This is intentionally independent of an LLM.
    The generated inputs are later executed against
    the verified reference solution.
    """

    tests: list[DSATestCase] = []

    # These cases are deliberately generic for
    # array-based problems whose first value is N.
    #
    # The next version will make this generator
    # constraint-aware based on the problem schema.

    candidates = [
        (
            "5\n1 2 3 4 5",
            "Small increasing positive array."
        ),
        (
            "5\n5 4 3 2 1",
            "Small decreasing array."
        ),
        (
            "5\n1 1 1 1 1",
            "Duplicate-value case."
        ),
        (
            "5\n-5 -4 -3 -2 -1",
            "All-negative case."
        ),
        (
            "6\n1 -1 1 -1 1 -1",
            "Alternating-sign case."
        ),
        (
            "7\n0 0 0 0 0 0 0",
            "Zero-heavy case."
        ),
        (
            "8\n1 3 2 5 4 6 5 7",
            "Mixed values with repeated patterns."
        ),
    ]

    for input_data, explanation in candidates:

        if len(tests) >= count:
            break

        tests.append(
            DSATestCase(
                input=input_data,
                explanation=explanation,
                expected_output=None,
                is_hidden=True,
            )
        )

    return tests