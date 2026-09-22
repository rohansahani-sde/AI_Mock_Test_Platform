const axios = require("axios");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

async function generateMCQ({
    role,
    difficulty,
    topic,
}) {
    const response = await axios.post(
        `${AI_SERVICE_URL}/ai/generate-mcq`,
        {
            role,
            difficulty,
            topic,
        },
        {
            timeout: 60000,
        }
    );

    return response.data;
}

async function generateDSA({
    role,
    difficulty,
    topic,
}) {
    const response = await axios.post(
        `${AI_SERVICE_URL}/ai/generate-dsa`,
        {
            role,
            difficulty,
            topic,
        },
        {
            timeout: 60000,
        }
    );

    return response.data;
}

async function executeCode({ code, language = "python", stdin, timeoutSeconds = 5 }) {
    const response = await axios.post(
        `${AI_SERVICE_URL}/ai/execute-code`,
        {
            code,
            language,
            stdin: stdin || "",
            timeout_seconds: timeoutSeconds,
        },
        {
            timeout: 20000,
        }
    );

    return response.data;
}

async function verifySolution({ code, language = "python", testCases, timeoutSeconds = 5 }) {
    const response = await axios.post(
        `${AI_SERVICE_URL}/ai/verify-solution`,
        {
            code,
            language,
            test_cases: testCases,
            timeout_seconds: timeoutSeconds,
        },
        {
            timeout: 60000,
        }
    );

    return response.data;
}

module.exports = {
    generateMCQ,
    generateDSA,
    executeCode,
    verifySolution,
};