from pydantic import BaseModel, Field


class DSAExample(BaseModel):
    input: str
    output: str
    explanation: str


class InputField(BaseModel):
    name: str = Field(
        description="Name of the input variable"
    )

    data_type: str = Field(
        description=(
            "Input type such as integer, "
            "integer_array, string, or matrix"
        )
    )

    description: str = Field(
        description="Description of the input field"
    )

    min_value: int | None = Field(
        default=None,
        description="Minimum allowed value"
    )

    max_value: int | None = Field(
        default=None,
        description="Maximum allowed value"
    )

    length_from: str | None = Field(
        default=None,
        description=(
            "Variable determining the length "
            "of this field"
        )
    )


class InputSpecification(BaseModel):
    fields: list[InputField] = Field(
        min_length=1,
        description="Machine-readable input fields"
    )


class DSAQuestion(BaseModel):
    title: str = Field(
        description="Short title of the programming problem"
    )

    description: str = Field(
        description="Complete programming problem statement"
    )

    input_format: str = Field(
        description=(
            "Exact format of input provided through stdin"
        )
    )

    output_format: str = Field(
        description=(
            "Exact format of output expected on stdout"
        )
    )

    input_specification: InputSpecification = Field(
        description=(
            "Machine-readable specification of "
            "the input format"
        )
    )

    role: str = Field(
        description="Target software engineering role"
    )

    difficulty: str = Field(
        description=(
            "Problem difficulty: EASY, MEDIUM, or HARD"
        )
    )

    topics: list[str] = Field(
        description=(
            "Programming and algorithm topics involved"
        )
    )

    constraints: list[str] = Field(
        description="Human-readable problem constraints"
    )

    examples: list[DSAExample] = Field(
        min_length=2,
        max_length=3,
        description="Two or three valid examples"
    )


    
# from pydantic import BaseModel, Field


# class DSAExample(BaseModel):
#     input: str
#     output: str
#     explanation: str


# class DSAQuestion(BaseModel):
#     title: str = Field(
#         description="Short title of the programming problem"
#     )

#     description: str = Field(
#         description="Complete programming problem statement"
#     )

#     input_format: str = Field(
#         description="Exact format of the input provided through stdin"
#     )

#     output_format: str = Field(
#         description="Exact format of the output expected on stdout"
#     )

#     role: str = Field(
#         description="Target software engineering role"
#     )

#     difficulty: str = Field(
#         description="Problem difficulty: EASY, MEDIUM, or HARD"
#     )

#     topics: list[str] = Field(
#         description="Programming and algorithm topics involved"
#     )

#     constraints: list[str] = Field(
#         description="Input constraints for the problem"
#     )

#     examples: list[DSAExample] = Field(
#         min_length=2,
#         max_length=3,
#         description="Two or three valid examples"
#     )


# from pydantic import BaseModel, Field


# class DSAExample(BaseModel):
#     input: str
#     output: str
#     explanation: str


# class DSAQuestion(BaseModel):
#     title: str = Field(
#         description="Short title of the programming problem"
#     )

#     description: str = Field(
#         description="Complete programming problem statement including input and output format"
#     )

#     role: str = Field(
#         description="Target software engineering role"
#     )

#     difficulty: str = Field(
#         description="Problem difficulty: EASY, MEDIUM, or HARD"
#     )

#     topics: list[str] = Field(
#         description="Programming and algorithm topics involved"
#     )

#     constraints: list[str] = Field(
#         description="Input constraints for the problem"
#     )

#     examples: list[DSAExample] = Field(
#         min_length=2,
#         max_length=3,
#         description="Two or three valid examples"
#     )