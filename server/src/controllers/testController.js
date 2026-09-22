const {
    generateMCQ,
    generateDSA,
    executeCode,
    verifySolution,
} = require("../services/aiService");

const Test = require("../models/Test");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

// Role-specific suggested topics
const ROLE_TOPICS = {
    "AI Engineer": [
        "Machine Learning",
        "Deep Learning & PyTorch",
        "NLP & Transformers",
        "Python & NumPy",
        "Model Optimization",
    ],
    "Software Engineer": [
        "Data Structures",
        "Algorithms",
        "Object Oriented Design",
        "Databases & SQL",
        "System Design Fundamentals",
    ],
    "Full Stack": [
        "React & Frontend State",
        "Node.js & Express",
        "REST APIs & Authentication",
        "Database Design & MongoDB",
        "Async JavaScript",
    ],
    "Backend Developer": [
        "Node.js & Concurrency",
        "API Design & Caching",
        "Database Indexing & Queries",
        "Microservices & Queues",
        "Security & Auth",
    ],
    "Frontend Developer": [
        "React Hooks & Performance",
        "DOM & CSS Architecture",
        "TypeScript & Web APIs",
        "State Management",
        "Responsive UI & Accessibility",
    ],
    "Data Scientist": [
        "Exploratory Data Analysis",
        "Probability & Statistics",
        "Feature Engineering",
        "Machine Learning Algorithms",
        "Pandas & Data Processing",
    ],
};

const DSA_TOPICS = [
    "Arrays",
    "Strings",
    "Two Pointers",
    "Sliding Window",
    "Hashing & Maps",
    "Stacks and Queues",
    "Binary Search",
];

const DEFAULT_PYTHON_STARTER = `import sys

def solve():
    # Read all input from standard input
    input_text = sys.stdin.read().strip()
    if not input_text:
        return
    
    # Process input lines
    lines = input_text.splitlines()
    
    # TODO: Implement your solution here
    print("Output")

if __name__ == '__main__':
    solve()
`;

const DEFAULT_JS_STARTER = `const fs = require('fs');

function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    const lines = input.split(/\\r?\\n/);
    
    // TODO: Implement your solution here
    console.log("Output");
}

solve();
`;

// Helper to get random topics
function getTopicForIndex(role, index) {
    const list = ROLE_TOPICS[role] || ROLE_TOPICS["Software Engineer"];
    return list[index % list.length];
}

function getDSATopicForIndex(index) {
    return DSA_TOPICS[index % DSA_TOPICS.length];
}

/**
 * GENERATE TEST
 */
async function generateTest(req, res) {
    try {
        const {
            title,
            role,
            difficulty,
            type, // "MCQ" | "DSA" | "MCQ_DSA"
            topic,
            questionCount,
            durationMinutes,
        } = req.body;

        if (!role || !difficulty || !type) {
            return res.status(400).json({
                success: false,
                message: "role, difficulty, and type are required",
            });
        }

        const normDiff = difficulty.toUpperCase();
        const normType = type.toUpperCase();

        if (!["MCQ", "DSA", "MCQ_DSA"].includes(normType)) {
            return res.status(400).json({
                success: false,
                message: "type must be MCQ, DSA, or MCQ_DSA",
            });
        }

        if (!["EASY", "MEDIUM", "HARD"].includes(normDiff)) {
            return res.status(400).json({
                success: false,
                message: "difficulty must be EASY, MEDIUM, or HARD",
            });
        }

        // Determine question breakdown based on format
        let mcqTarget = 0;
        let dsaTarget = 0;

        if (normType === "MCQ") {
            mcqTarget = questionCount ? Math.min(Math.max(parseInt(questionCount), 1), 15) : 5;
        } else if (normType === "DSA") {
            dsaTarget = questionCount ? Math.min(Math.max(parseInt(questionCount), 1), 5) : 3;
        } else if (normType === "MCQ_DSA") {
            // MCQ + DSA: 5 MCQ + 2 DSA default (or specified)
            mcqTarget = 5;
            dsaTarget = questionCount ? Math.min(Math.max(parseInt(questionCount), 2), 3) : 2;
        }

        // Default durations if not passed
        let duration = durationMinutes;
        if (!duration) {
            if (normType === "MCQ") duration = mcqTarget * 3; // ~15 min
            else if (normType === "DSA") duration = dsaTarget * 20; // ~60 min
            else duration = (mcqTarget * 2) + (dsaTarget * 20); // ~50 min
        }

        const generatedQuestions = [];

        // Generate MCQs in parallel batches to speed up response
        const mcqPromises = [];
        for (let i = 0; i < mcqTarget; i++) {
            const currentTopic = topic || getTopicForIndex(role, i);
            mcqPromises.push(
                generateMCQ({
                    role,
                    difficulty: normDiff,
                    topic: currentTopic,
                }).catch((err) => {
                    console.warn(`MCQ gen failed for topic ${currentTopic}, retrying with fallback`, err.message);
                    return generateMCQ({
                        role,
                        difficulty: normDiff,
                        topic: "General Programming",
                    });
                })
            );
        }

        const mcqResults = await Promise.all(mcqPromises);

        for (const resItem of mcqResults) {
            if (resItem && resItem.question) {
                const q = resItem.question;
                generatedQuestions.push({
                    type: "MCQ",
                    title: q.question,
                    description: q.question,
                    role: q.role || role,
                    difficulty: q.difficulty || normDiff,
                    topics: q.topic ? [q.topic] : [topic || "General"],
                    options: q.options || [],
                    correctAnswer: q.correct_answer ?? 0,
                    explanation: q.explanation || "",
                    starterCode: {},
                    generatedByAI: true,
                    aiModel: "groq",
                });
            }
        }

        // Generate DSA questions
        const dsaPromises = [];
        for (let j = 0; j < dsaTarget; j++) {
            const currentDsaTopic = getDSATopicForIndex(j);
            dsaPromises.push(
                generateDSA({
                    role,
                    difficulty: normDiff,
                    topic: currentDsaTopic,
                }).catch((err) => {
                    console.warn(`DSA gen failed for topic ${currentDsaTopic}, retrying with fallback`, err.message);
                    return generateDSA({
                        role,
                        difficulty: normDiff,
                        topic: "Arrays",
                    });
                })
            );
        }

        const dsaResults = await Promise.all(dsaPromises);

        for (const resItem of dsaResults) {
            if (resItem && resItem.question) {
                const q = resItem.question;
                // Build test cases from examples
                const testCases = (q.examples || []).map((ex) => ({
                    input: ex.input || "",
                    expectedOutput: ex.output || "",
                    isHidden: false,
                }));

                generatedQuestions.push({
                    type: "DSA",
                    title: q.title,
                    description: q.description,
                    role: q.role || role,
                    difficulty: q.difficulty || normDiff,
                    topics: q.topics || ["Algorithms"],
                    constraints: q.constraints || [],
                    examples: q.examples || [],
                    testCases: testCases,
                    starterCode: {
                        python: DEFAULT_PYTHON_STARTER,
                        javascript: DEFAULT_JS_STARTER,
                    },
                    generatedByAI: true,
                    aiModel: "groq",
                });
            }
        }

        if (generatedQuestions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate questions. Please try again.",
            });
        }

        // Save questions
        const savedQuestions = await Question.insertMany(generatedQuestions);
        const questionIds = savedQuestions.map((q) => q._id);

        const test = await Test.create({
            userId: req.user._id,
            title: title || `${role} - ${normDiff} (${normType}) Mock Assessment`,
            role,
            difficulty: normDiff,
            testType: normType,
            questionIds,
            questionCount: savedQuestions.length,
            durationMinutes: duration,
            status: "CREATED",
        });

        return res.status(201).json({
            success: true,
            message: "Test generated successfully",
            test: {
                id: test._id,
                title: test.title,
                role: test.role,
                difficulty: test.difficulty,
                type: test.testType,
                questionCount: test.questionCount,
                durationMinutes: test.durationMinutes,
                status: test.status,
                questions: savedQuestions,
            },
        });
    } catch (error) {
        console.error("Test generation error:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate test",
            error: error.response?.data || error.message,
        });
    }
}

/**
 * GET TEST BY ID
 */
async function getTestById(req, res) {
    try {
        const { id } = req.params;

        const test = await Test.findOne({
            _id: id,
            userId: req.user._id,
        }).populate("questionIds");

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        // If test is not submitted yet, sanitize questions so user cannot see MCQ answers in devtools
        const isSubmitted = test.status === "SUBMITTED";
        const sanitizedQuestions = test.questionIds.map((q) => {
            const qObj = q.toObject();
            if (!isSubmitted && qObj.type === "MCQ") {
                delete qObj.correctAnswer;
                delete qObj.explanation;
            }
            return qObj;
        });

        return res.status(200).json({
            success: true,
            test: {
                ...test.toObject(),
                questionIds: sanitizedQuestions,
            },
        });
    } catch (error) {
        console.error("Get test error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test",
        });
    }
}

/**
 * START TEST
 */
async function startTest(req, res) {
    try {
        const { id } = req.params;

        const test = await Test.findOne({
            _id: id,
            userId: req.user._id,
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        if (test.status === "CREATED") {
            const startedAt = new Date();
            const expiresAt = new Date(startedAt.getTime() + test.durationMinutes * 60 * 1000);

            test.status = "IN_PROGRESS";
            test.startedAt = startedAt;
            test.expiresAt = expiresAt;
            await test.save();
        }

        return res.status(200).json({
            success: true,
            test: {
                id: test._id,
                status: test.status,
                startedAt: test.startedAt,
                expiresAt: test.expiresAt,
            },
        });
    } catch (error) {
        console.error("Start test error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to start test",
        });
    }
}

/**
 * RUN CODE (Candidate testing DSA code before submission)
 */
async function runCode(req, res) {
    try {
        const { id } = req.params;
        const { code, language = "python", input } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Code is required",
            });
        }

        const result = await executeCode({
            code,
            language,
            stdin: input || "",
            timeoutSeconds: 5,
        });

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Run code error:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Code execution failed",
            error: error.response?.data || error.message,
        });
    }
}

/**
 * SUBMIT TEST
 */
async function submitTest(req, res) {
    try {
        const { id } = req.params;
        const { answers } = req.body; // array of { questionId, type, selectedOption, code }

        const test = await Test.findOne({
            _id: id,
            userId: req.user._id,
        }).populate("questionIds");

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        const answersMap = {};
        if (Array.isArray(answers)) {
            answers.forEach((ans) => {
                if (ans.questionId) {
                    answersMap[ans.questionId.toString()] = ans;
                }
            });
        }

        let totalScore = 0;
        let score = 0;
        const evaluatedAnswers = [];

        for (const question of test.questionIds) {
            const qIdStr = question._id.toString();
            const userAns = answersMap[qIdStr] || {};
            const qPoints = question.type === "DSA" ? 20 : 10;
            totalScore += qPoints;

            if (question.type === "MCQ") {
                const selectedOption = userAns.selectedOption !== undefined ? parseInt(userAns.selectedOption) : null;
                const isCorrect = selectedOption !== null && selectedOption === question.correctAnswer;
                const points = isCorrect ? qPoints : 0;
                score += points;

                evaluatedAnswers.push({
                    questionId: question._id,
                    type: "MCQ",
                    selectedOption,
                    code: "",
                    isCorrect,
                    points,
                    executionResult: null,
                });
            } else if (question.type === "DSA") {
                const code = userAns.code || "";
                const language = userAns.language || "python";
                let isCorrect = false;
                let points = 0;
                let executionResult = null;

                if (code.trim()) {
                    // Evaluate code against test cases
                    const testCases = (question.testCases && question.testCases.length > 0)
                        ? question.testCases
                        : (question.examples || []).map((ex) => ({
                              input: ex.input,
                              expectedOutput: ex.output,
                          }));

                    console.log(`[submitTest] DSA question ${question._id}: language=${language}, testCases=${testCases.length}, codeLen=${code.length}`);

                    if (testCases.length > 0) {
                        try {
                            const verifyRes = await verifySolution({
                                code,
                                language,
                                testCases: testCases.map((tc) => ({
                                    input: tc.input || "",
                                    expected_output: tc.expectedOutput || tc.output || "",
                                })),
                            });

                            console.log(`[submitTest] DSA verify result:`, JSON.stringify(verifyRes));
                            executionResult = verifyRes;
                            if (verifyRes.total > 0) {
                                const passRatio = verifyRes.passed / verifyRes.total;
                                points = Math.round(qPoints * passRatio);
                                isCorrect = verifyRes.is_all_passed;
                            }
                        } catch (execErr) {
                            console.warn("DSA verification error during test submission:", execErr.message);
                            executionResult = { error: execErr.message, passed: 0, total: testCases.length };
                        }
                    } else {
                        // No test cases — give partial credit if code is non-trivial
                        console.warn(`[submitTest] DSA question ${question._id} has no test cases; granting partial credit`);
                        points = Math.round(qPoints * 0.5);
                        isCorrect = false;
                    }
                }

                score += points;
                evaluatedAnswers.push({
                    questionId: question._id,
                    type: "DSA",
                    selectedOption: null,
                    code,
                    isCorrect,
                    points,
                    executionResult,
                });
            }
        }

        const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
        const submittedAt = new Date();

        // Create or update Attempt
        const attempt = await Attempt.create({
            userId: req.user._id,
            testId: test._id,
            answers: evaluatedAnswers,
            score,
            totalScore,
            percentage,
            startedAt: test.startedAt || new Date(),
            submittedAt,
        });

        test.status = "SUBMITTED";
        await test.save();

        return res.status(200).json({
            success: true,
            message: "Test submitted successfully",
            attempt: {
                id: attempt._id,
                score,
                totalScore,
                percentage,
                submittedAt,
                answers: evaluatedAnswers,
            },
        });
    } catch (error) {
        console.error("Submit test error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to submit test",
            error: error.message,
        });
    }
}

/**
 * GET MY TESTS (User dashboard history)
 */
async function getMyTests(req, res) {
    try {
        const tests = await Test.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Attach attempt scores to submitted tests
        const testIds = tests.map((t) => t._id);
        const attempts = await Attempt.find({
            userId: req.user._id,
            testId: { $in: testIds },
        }).lean();

        const attemptMap = {};
        attempts.forEach((att) => {
            attemptMap[att.testId.toString()] = att;
        });

        const formattedTests = tests.map((t) => {
            const att = attemptMap[t._id.toString()];
            return {
                id: t._id,
                title: t.title,
                role: t.role,
                difficulty: t.difficulty,
                testType: t.testType,
                questionCount: t.questionCount,
                durationMinutes: t.durationMinutes,
                status: t.status,
                createdAt: t.createdAt,
                score: att ? att.score : null,
                totalScore: att ? att.totalScore : null,
                percentage: att ? att.percentage : null,
                attemptId: att ? att._id : null,
            };
        });

        return res.status(200).json({
            success: true,
            tests: formattedTests,
        });
    } catch (error) {
        console.error("Get my tests error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user tests",
        });
    }
}

/**
 * GET TEST RESULT (Detailed analysis and explanations)
 */
async function getTestResult(req, res) {
    try {
        const { id } = req.params;

        const test = await Test.findOne({
            _id: id,
            userId: req.user._id,
        }).populate("questionIds");

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        const attempt = await Attempt.findOne({
            testId: test._id,
            userId: req.user._id,
        }).sort({ createdAt: -1 });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "No attempt found for this test",
            });
        }

        const answersMap = {};
        attempt.answers.forEach((ans) => {
            answersMap[ans.questionId.toString()] = ans;
        });

        const detailedQuestions = test.questionIds.map((q) => {
            const userAns = answersMap[q._id.toString()] || {};
            return {
                id: q._id,
                type: q.type,
                title: q.title,
                description: q.description,
                difficulty: q.difficulty,
                topics: q.topics,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                constraints: q.constraints,
                examples: q.examples,
                userAnswer: userAns,
            };
        });

        return res.status(200).json({
            success: true,
            result: {
                test: {
                    id: test._id,
                    title: test.title,
                    role: test.role,
                    difficulty: test.difficulty,
                    testType: test.testType,
                    durationMinutes: test.durationMinutes,
                },
                attempt: {
                    id: attempt._id,
                    score: attempt.score,
                    totalScore: attempt.totalScore,
                    percentage: attempt.percentage,
                    startedAt: attempt.startedAt,
                    submittedAt: attempt.submittedAt,
                },
                questions: detailedQuestions,
            },
        });
    } catch (error) {
        console.error("Get test result error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test result",
        });
    }
}

module.exports = {
    generateTest,
    getTestById,
    startTest,
    runCode,
    submitTest,
    getMyTests,
    getTestResult,
};