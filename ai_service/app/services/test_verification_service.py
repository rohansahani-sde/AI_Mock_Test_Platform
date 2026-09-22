from app.executors.python_executor import execute_python
from app.models.dsa_question import DSAQuestion
from app.models.reference_solution import ReferenceSolution
from app.models.test_case import DSATestCase
from app.services.test_case_validator import validate_test_case


def normalize_output(output: str) -> str:
    return output.replace("\r\n", "\n").strip()


def verify_test_case(
    question: DSAQuestion,
    reference_solution: ReferenceSolution,
    test_case: DSATestCase,
) -> DSATestCase:

    valid, message = validate_test_case(
        question=question,
        test_case=test_case,
    )

    if not valid:
        raise ValueError(message)

    result = execute_python(
        code=reference_solution.code,
        stdin=test_case.input,
        timeout_seconds=3,
    )

    if result.timed_out:
        raise ValueError(
            "Reference solution timed out."
        )

    if not result.success:
        raise ValueError(
            "Reference solution failed to execute.\n"
            f"stderr:\n{result.stderr}"
        )

    expected_output = normalize_output(
        result.stdout
    )

    if not expected_output:
        raise ValueError(
            "Reference solution produced empty output."
        )

    return DSATestCase(
        input=test_case.input,
        explanation=test_case.explanation,
        expected_output=expected_output,
        is_hidden=True,
    )

# from app.executors.python_executor import execute_python
# from app.models.dsa_question import DSAQuestion
# from app.models.reference_solution import ReferenceSolution
# from app.models.test_case import DSATestCase


# def normalize_output(output: str) -> str:
#     """
#     Normalize program output before comparison.

#     Removes leading/trailing whitespace and normalizes
#     line endings.
#     """

#     return output.replace("\r\n", "\n").strip()


# def verify_test_case(
#     question: DSAQuestion,
#     reference_solution: ReferenceSolution,
#     test_case: DSATestCase,
# ) -> DSATestCase:

#     result = execute_python(
#         code=reference_solution.code,
#         stdin=test_case.input,
#         timeout_seconds=3,
#     )

#     if result.timed_out:
#         raise ValueError(
#             "Reference solution timed out."
#         )

#     if not result.success:
#         raise ValueError(
#             "Reference solution failed to execute.\n"
#             f"stderr: {result.stderr}"
#         )

#     expected_output = normalize_output(
#         result.stdout
#     )

#     if not expected_output:
#         raise ValueError(
#             "Reference solution produced empty output."
#         )

#     return DSATestCase(
#         input=test_case.input,
#         explanation=test_case.explanation,
#         expected_output=expected_output,
#         is_hidden=True,
#     )