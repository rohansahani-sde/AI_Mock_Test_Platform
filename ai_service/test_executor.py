from app.generators.dsa_generator import generate_dsa
from app.generators.reference_solution_generator import generate_reference_solution


question = generate_dsa(
    role="Software Engineer",
    difficulty="MEDIUM",
    topic="Arrays",
)


print("\n==============================")
print("QUESTION")
print("==============================")

print(question.title)
print(question.description)

print("\nTopics:")
print(", ".join(question.topics))

print("\nConstraints:")
for constraint in question.constraints:
    print("-", constraint)


print("\n==============================")
print("EXAMPLES")
print("==============================")

for index, example in enumerate(question.examples, start=1):

    print(f"\nExample {index}")

    print("Input:")
    print(example.input)

    print("Output:")
    print(example.output)

    print("Explanation:")
    print(example.explanation)


print("\n==============================")
print("REFERENCE SOLUTION")
print("==============================")

reference = generate_reference_solution(
    question
)

print("Language:")
print(reference.language)

print("\nCode:")
print(reference.code)

print("\nExplanation:")
print(reference.explanation)