from app.templates.python import PYTHON_TEMPLATE
from app.templates.java import JAVA_TEMPLATE
from app.templates.cpp import CPP_TEMPLATE


CODE_TEMPLATES = {
    "python": PYTHON_TEMPLATE,
    "java": JAVA_TEMPLATE,
    "cpp": CPP_TEMPLATE,
}


def get_code_template(language: str) -> str:
    language = language.lower().strip()

    if language not in CODE_TEMPLATES:
        raise ValueError(
            f"Unsupported language: {language}"
        )

    return CODE_TEMPLATES[language]


def get_supported_languages() -> list[str]:
    return list(CODE_TEMPLATES.keys())