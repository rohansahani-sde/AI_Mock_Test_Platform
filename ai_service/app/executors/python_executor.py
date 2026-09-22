import os
import subprocess
import sys
import tempfile

from pydantic import BaseModel


class ExecutionResult(BaseModel):
    success: bool
    stdout: str
    stderr: str
    exit_code: int | None
    timed_out: bool
    error: str | None = None


def execute_python(
    code: str,
    stdin: str = "",
    timeout_seconds: int = 2,
    max_output_chars: int = 5000,
) -> ExecutionResult:

    temp_dir = None

    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp(
            prefix="ai_mock_test_"
        )

        script_path = os.path.join(
            temp_dir,
            "main.py",
        )

        # Write candidate/reference code
        with open(
            script_path,
            "w",
            encoding="utf-8",
        ) as file:
            file.write(code)

        # Execute Python program
        process = subprocess.run(
            [
                sys.executable,
                "-I",
                script_path,
            ],
            input=stdin,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            cwd=temp_dir,
            shell=False,
        )

        stdout = process.stdout[:max_output_chars]
        stderr = process.stderr[:max_output_chars]

        return ExecutionResult(
            success=process.returncode == 0,
            stdout=stdout,
            stderr=stderr,
            exit_code=process.returncode,
            timed_out=False,
        )

    except subprocess.TimeoutExpired as error:

        return ExecutionResult(
            success=False,
            stdout=(error.stdout or "")[:max_output_chars]
            if isinstance(error.stdout, str)
            else "",
            stderr=(error.stderr or "")[:max_output_chars]
            if isinstance(error.stderr, str)
            else "",
            exit_code=None,
            timed_out=True,
            error="Execution timed out.",
        )

    except Exception as error:

        return ExecutionResult(
            success=False,
            stdout="",
            stderr="",
            exit_code=None,
            timed_out=False,
            error=str(error),
        )

    finally:
        # Remove temporary files
        if temp_dir and os.path.exists(temp_dir):
            try:
                import shutil

                shutil.rmtree(
                    temp_dir,
                    ignore_errors=True,
                )
            except Exception:
                pass