from app.generators.dsa_generator import generate_dsa
from app.generators.reference_solution_generator import (
    generate_reference_solution,
)
from app.generators.test_case_generator import (
    generate_test_cases,
)
from app.services.test_verification_service import (
    verify_test_case,
)


def generate_verified_dsa_test(
    role: str,
    difficulty: str,
    topic: str,
    test_count: int = 5,
):
    print("\nGenerating DSA problem...")

    question = generate_dsa(
        role=role,
        difficulty=difficulty,
        topic=topic,
    )

    print(
        f"Generated problem: {question.title}"
    )

    print("\nGenerating reference solution...")

    reference_solution = generate_reference_solution(
        question
    )

    print(
        "Reference solution verified successfully."
    )

    print(
        f"\nGenerating {test_count} hidden test cases..."
    )

    raw_test_cases = generate_test_cases(
        question=question,
        count=test_count,
    )

    verified_tests = []
    seen_inputs = set()

    for index, test_case in enumerate(
        raw_test_cases,
        start=1,
    ):

        normalized_input = test_case.input.strip()

        print(
            f"\nVerifying hidden test {index}..."
        )

        if not normalized_input:
            print("Skipped: empty input.")
            continue

        if normalized_input in seen_inputs:
            print("Skipped: duplicate input.")
            continue

        try:

            verified_test = verify_test_case(
                question=question,
                reference_solution=reference_solution,
                test_case=test_case,
            )

            verified_tests.append(
                verified_test
            )

            seen_inputs.add(
                normalized_input
            )

            print(
                "Hidden test verified successfully."
            )

        except ValueError as error:

            print(
                "Hidden test verification failed:"
            )

            print(error)

    if not verified_tests:
        raise ValueError(
            "No valid hidden test cases were generated."
        )

    return {
        "question": question,
        "reference_solution": reference_solution,
        "test_cases": verified_tests,
    }


# from app.generators.reference_solution_generator import (
#     generate_reference_solution,
# )

# from app.generators.test_case_generator import (
#     generate_test_cases,
# )

# from app.generators.dsa_generator import (
#     generate_dsa,
# )

# from app.services.test_verification_service import (
#     verify_test_case,
# )


# def generate_verified_dsa_test(
#     role: str,
#     difficulty: str,
#     topic: str,
#     test_count: int = 5,
# ):

#     question = generate_dsa(
#         role=role,
#         difficulty=difficulty,
#         topic=topic,
#     )

#     reference_solution = generate_reference_solution(
#         question
#     )

#     raw_test_cases = generate_test_cases(
#         question=question,
#         count=test_count,
#     )

#     verified_tests = []
#     seen_inputs = set()

#     for test_case in raw_test_cases:

#         normalized_input = test_case.input.strip()

#         if not normalized_input:
#             continue

#         if normalized_input in seen_inputs:
#             continue

#         try:

#             verified_test = verify_test_case(
#                 question=question,
#                 reference_solution=reference_solution,
#                 test_case=test_case,
#             )

#             verified_tests.append(
#                 verified_test
#             )

#             seen_inputs.add(
#                 normalized_input
#             )

#         except ValueError as error:

#             print(
#                 "Test case verification failed:"
#             )

#             print(error)

#     if not verified_tests:
#         raise ValueError(
#             "No valid hidden test cases were generated."
#         )

#     return {
#         "question": question,
#         "test_cases": verified_tests,
#     }
# from app.generators.reference_solution_generator import (
#     generate_reference_solution,
# )

# from app.generators.test_case_generator import (
#     generate_test_cases,
# )

# from app.generators.dsa_generator import (
#     generate_dsa,
# )

# from app.services.test_verification_service import (
#     verify_test_case,
# )


# def generate_verified_dsa_test(
#     role: str,
#     difficulty: str,
#     topic: str,
#     test_count: int = 5,
# ):

#     # --------------------------------------------------
#     # 1. Generate DSA problem
#     # --------------------------------------------------

#     question = generate_dsa(
#         role=role,
#         difficulty=difficulty,
#         topic=topic,
#     )

#     # --------------------------------------------------
#     # 2. Generate internal reference solution
#     # --------------------------------------------------

#     reference_solution = generate_reference_solution(
#         question
#     )

#     # --------------------------------------------------
#     # 3. Generate hidden test inputs
#     # --------------------------------------------------

#     test_cases = generate_test_cases(
#         question=question,
#         count=test_count,
#     )

#     # --------------------------------------------------
#     # 4. Verify every test case
#     # --------------------------------------------------

#     verified_tests = []

#     for test_case in test_cases:

#         verified_test = verify_test_case(
#             question=question,
#             reference_solution=reference_solution,
#             test_case=test_case,
#         )

#         verified_tests.append(
#             verified_test
#         )

#     return {
#         "question": question,
#         "test_cases": verified_tests,
#     }