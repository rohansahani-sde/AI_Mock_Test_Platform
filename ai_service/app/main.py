from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.generators.mcq_generator import generate_mcq
from app.generators.dsa_generator import generate_dsa

from app.executors.code_executor import execute_code


app = FastAPI(
    title="AI Mock Test Service",
    version="1.0.0",
)


class MCQRequest(BaseModel):
    role: str
    difficulty: str
    topic: str

class DSARequest(BaseModel):
    role: str
    difficulty: str
    topic: str

class ExecuteCodeRequest(BaseModel):
    code: str
    language: str = "python"
    stdin: str = ""
    timeout_seconds: int = 5

class TestCaseItem(BaseModel):
    input: str
    expected_output: str

class VerifySolutionRequest(BaseModel):
    code: str
    language: str = "python"
    test_cases: list[TestCaseItem]
    timeout_seconds: int = 5


@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "AI service is running",
    }


@app.post("/ai/generate-mcq")
def generate_mcq_endpoint(request: MCQRequest):
    try:
        question = generate_mcq(
            role=request.role,
            difficulty=request.difficulty,
            topic=request.topic,
        )

        return {
            "success": True,
            "question": question.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )



@app.post("/ai/generate-dsa")
def generate_dsa_endpoint(request: DSARequest):
    try:
        question = generate_dsa(
            role=request.role,
            difficulty=request.difficulty,
            topic=request.topic,
        )
        
        return {
            "success": True,
            "question": question.model_dump(),
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.post("/ai/execute-code")
def execute_code_endpoint(request: ExecuteCodeRequest):
    try:
        result = execute_code(
            code=request.code,
            language=request.language,
            stdin=request.stdin,
            timeout_seconds=request.timeout_seconds,
        )

        return {
            "success": result.success,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.exit_code,
            "timed_out": result.timed_out,
            "error": result.error,
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


def _normalize_text(val: str) -> str:
    if not val:
        return ""
    lines = [line.strip() for line in val.replace("\r\n", "\n").strip().splitlines()]
    return "\n".join(lines).strip()


@app.post("/ai/verify-solution")
def verify_solution_endpoint(request: VerifySolutionRequest):
    try:
        total = len(request.test_cases)
        passed = 0
        results = []

        for tc in request.test_cases:
            run_res = execute_code(
                code=request.code,
                language=request.language,
                stdin=tc.input,
                timeout_seconds=request.timeout_seconds,
            )

            norm_actual = _normalize_text(run_res.stdout)
            norm_expected = _normalize_text(tc.expected_output)
            is_match = run_res.success and (norm_actual == norm_expected)

            if is_match:
                passed += 1

            results.append({
                "input": tc.input,
                "expected": norm_expected,
                "actual": norm_actual,
                "success": is_match,
                "timed_out": run_res.timed_out,
                "error": run_res.stderr or run_res.error or ("Output mismatch" if not is_match else None),
            })

        return {
            "success": True,
            "total": total,
            "passed": passed,
            "is_all_passed": (total > 0 and passed == total),
            "results": results,
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )