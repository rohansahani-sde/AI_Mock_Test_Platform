import os
import shutil
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


def execute_code(
    code: str,
    language: str = "python",
    stdin: str = "",
    timeout_seconds: int = 4,
    max_output_chars: int = 5000,
) -> ExecutionResult:
    lang = language.lower().strip()
    temp_dir = None

    try:
        temp_dir = tempfile.mkdtemp(prefix="mock_test_exec_")

        if lang in ["python", "py"]:
            script_path = os.path.join(temp_dir, "main.py")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(code)

            cmd = [sys.executable, "-I", script_path]

        elif lang in ["javascript", "js", "node"]:
            node_path = shutil.which("node")
            if not node_path:
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr="Node.js is not installed on this system.",
                    exit_code=1,
                    timed_out=False,
                    error="Node.js environment not found.",
                )
            script_path = os.path.join(temp_dir, "index.js")
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(code)

            cmd = [node_path, script_path]

        elif lang in ["java"]:
            javac_path = shutil.which("javac")
            java_path = shutil.which("java")
            if not javac_path or not java_path:
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr="Java Development Kit (javac/java) is not installed on this system.",
                    exit_code=1,
                    timed_out=False,
                    error="JDK environment not found.",
                )

            # Java source must be Main.java
            src_path = os.path.join(temp_dir, "Main.java")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile step
            compile_proc = subprocess.run(
                [javac_path, "Main.java"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )

            if compile_proc.returncode != 0:
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr=compile_proc.stderr[:max_output_chars],
                    exit_code=compile_proc.returncode,
                    timed_out=False,
                    error="Compilation Error",
                )

            cmd = [java_path, "Main"]

        elif lang in ["cpp", "c++", "c"]:
            gpp_path = shutil.which("g++") or shutil.which("clang++")
            if not gpp_path:
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr="g++ / clang++ C++ compiler is not installed on this server. Please choose Python, JavaScript, or Java to execute code.",
                    exit_code=1,
                    timed_out=False,
                    error="C++ compiler not installed on host.",
                )

            src_path = os.path.join(temp_dir, "main.cpp")
            exe_path = os.path.join(temp_dir, "main.exe")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            compile_proc = subprocess.run(
                [gpp_path, "-O2", "main.cpp", "-o", "main.exe"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )

            if compile_proc.returncode != 0:
                return ExecutionResult(
                    success=False,
                    stdout="",
                    stderr=compile_proc.stderr[:max_output_chars],
                    exit_code=compile_proc.returncode,
                    timed_out=False,
                    error="C++ Compilation Error",
                )

            cmd = [exe_path]

        else:
            return ExecutionResult(
                success=False,
                stdout="",
                stderr=f"Unsupported language: {language}",
                exit_code=1,
                timed_out=False,
                error=f"Unsupported language: {language}",
            )

        # Run process
        proc = subprocess.run(
            cmd,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            cwd=temp_dir,
            shell=False,
        )

        return ExecutionResult(
            success=proc.returncode == 0,
            stdout=proc.stdout[:max_output_chars],
            stderr=proc.stderr[:max_output_chars],
            exit_code=proc.returncode,
            timed_out=False,
        )

    except subprocess.TimeoutExpired as err:
        return ExecutionResult(
            success=False,
            stdout=(err.stdout or "")[:max_output_chars] if isinstance(err.stdout, str) else "",
            stderr=(err.stderr or "")[:max_output_chars] if isinstance(err.stderr, str) else "",
            exit_code=None,
            timed_out=True,
            error="Execution timed out.",
        )
    except Exception as err:
        return ExecutionResult(
            success=False,
            stdout="",
            stderr=str(err),
            exit_code=None,
            timed_out=False,
            error=str(err),
        )
    finally:
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
