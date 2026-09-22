from app.services.dsa_test_pipeline import (
    generate_verified_dsa_test,
)


result = generate_verified_dsa_test(
    role="Software Engineer",
    difficulty="MEDIUM",
    topic="Arrays",
    test_count=5,
)


question = result["question"]
reference = result["reference_solution"]
test_cases = result["test_cases"]


print("\n")
print("=" * 60)
print("FINAL VERIFIED DSA TEST")
print("=" * 60)

print("\nTITLE:")
print(question.title)

print("\nDESCRIPTION:")
print(question.description)

print("\nREFERENCE SOLUTION:")
print(reference.code)

print("\nHIDDEN TEST CASES:")
print("=" * 60)


for index, test_case in enumerate(
    test_cases,
    start=1,
):

    print(f"\nHidden Test {index}")

    print("\nInput:")
    print(test_case.input)

    print("Expected Output:")
    print(test_case.expected_output)

    print("\nReason:")
    print(test_case.explanation)