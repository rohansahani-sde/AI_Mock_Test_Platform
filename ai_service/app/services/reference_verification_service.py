from app.executors.python_executor import execute_python
from app.models.dsa_question import DSAQuestion
from app.models.reference_solution import ReferenceSolution


def normalize_output(output: str) -> str:
    return output.replace("\r\n", "\n").strip()


def verify_reference_solution(
    question: DSAQuestion,
    reference_solution: ReferenceSolution,
) -> tuple[bool, str]:

    if not question.examples:
        return False, "Problem has no examples."

    for index, example in enumerate(question.examples, start=1):

        result = execute_python(
            code=reference_solution.code,
            stdin=example.input,
            timeout_seconds=3,
        )

        if result.timed_out:
            return False, (
                f"Reference solution timed out on example {index}."
            )

        if not result.success:
            return False, (
                f"Reference solution failed on example {index}.\n"
                f"stderr:\n{result.stderr}"
            )

        actual_output = normalize_output(result.stdout)
        expected_output = normalize_output(example.output)

        if actual_output != expected_output:
            return False, (
                f"Wrong output on example {index}.\n"
                f"Expected: {expected_output}\n"
                f"Actual: {actual_output}"
            )

    return True, "Reference solution passed all examples."

# from app.executors.python_executor import execute_python
# from app.models.dsa_question import DSAQuestion
# from app.models.reference_solution import ReferenceSolution


# def normalize_output(output: str) -> str:
#     return output.replace("\r\n", "\n").strip()


# def verify_reference_solution(
#     question: DSAQuestion,
#     reference_solution: ReferenceSolution,
# ) -> tuple[bool, str]:

#     if not question.examples:
#         return False, "Problem has no examples."

#     for index, example in enumerate(question.examples, start=1):

#         result = execute_python(
#             code=reference_solution.code,
#             stdin=example.input,
#             timeout_seconds=3,
#         )

#         if result.timed_out:
#             return False, (
#                 f"Reference solution timed out on example {index}."
#             )

#         if not result.success:
#             return False, (
#                 f"Reference solution failed on example {index}.\n"
#                 f"stderr:\n{result.stderr}"
#             )

#         actual_output = normalize_output(result.stdout)
#         expected_output = normalize_output(example.output)

#         if actual_output != expected_output:
#             return False, (
#                 f"Wrong output on example {index}.\n"
#                 f"Expected: {expected_output}\n"
#                 f"Actual: {actual_output}"
#             )

#     return True, "Reference solution passed all examples."

# from app.executors.python_executor import execute_python
# from app.models.dsa_question import DSAQuestion
# from app.models.reference_solution import ReferenceSolution


# def normalize_output(output: str) -> str:
#     """
#     Normalize output before comparing expected and actual results.
#     """

#     return output.replace("\r\n", "\n").strip()


# def verify_reference_solution(
#     question: DSAQuestion,
#     reference_solution: ReferenceSolution,
# ) -> tuple[bool, str]:

#     if not question.examples:
#         return False, "Problem has no examples."

#     for index, example in enumerate(
#         question.examples,
#         start=1,
#     ):

#         result = execute_python(
#             code=reference_solution.code,
#             stdin=example.input,
#             timeout_seconds=3,
#         )

#         # Timeout
#         if result.timed_out:
#             return (
#                 False,
#                 f"Reference solution timed out on example {index}.",
#             )

#         # Runtime error
#         if not result.success:
#             return (
#                 False,
#                 (
#                     f"Reference solution failed on example {index}.\n"
#                     f"stderr:\n{result.stderr}"
#                 ),
#             )

#         actual_output = normalize_output(
#             result.stdout
#         )

#         expected_output = normalize_output(
#             example.output
#         )

#         # Wrong answer
#         if actual_output != expected_output:
#             return (
#                 False,
#                 (
#                     f"Wrong output on example {index}.\n"
#                     f"Expected: {expected_output}\n"
#                     f"Actual: {actual_output}"
#                 ),
#             )

#     return True, "Reference solution passed all examples."