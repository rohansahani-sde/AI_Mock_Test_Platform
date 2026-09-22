import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import {
  Clock,
  Code2,
  FileQuestion,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Send,
  X,
  RotateCcw,
  Cpu,
  Zap,
  Layers,
  ShieldCheck,
} from 'lucide-react';

// ── Language metadata ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'python', label: 'Python 3', monacoLang: 'python' },
  { value: 'javascript', label: 'JavaScript (Node)', monacoLang: 'javascript' },
  { value: 'java', label: 'Java 17', monacoLang: 'java' },
  { value: 'cpp', label: 'C++ (g++)', monacoLang: 'cpp' },
];

const DEFAULT_STARTERS = {
  python: `# Write your solution here\ndef solution():\n    pass\n`,
  javascript: `// Write your solution here\nfunction solution() {\n\n}\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
};

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 4,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'gutter',
  wordWrap: 'off',
  tabSize: 4,
  insertSpaces: true,
  automaticLayout: true,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  padding: { top: 12, bottom: 12 },
};

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: { questionId, type, selectedOption?, code?, language? } }

  // per-question language selection
  const [qLanguage, setQLanguage] = useState({});

  // per-question run output (keyed by question ID to prevent leakage between questions)
  const [runOutputs, setRunOutputs] = useState({});
  const [runningCode, setRunningCode] = useState(false);

  // per-question custom stdin
  const [customInputs, setCustomInputs] = useState({});

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ready screen: shown after load, before the timer starts
  const [testStarted, setTestStarted] = useState(false);
  // Store the computed duration so the ready screen can show it
  const pendingDurationRef = useRef(null);

  // Load test
  useEffect(() => {
    const fetchTestAndStart = async () => {
      try {
        setLoading(true);
        await api.post(`/tests/${id}/start`).catch(() => { });
        const res = await api.get(`/tests/${id}`);
        const testData = res.data.test;
        setTest(testData);

        if (testData.status === 'SUBMITTED') {
          navigate(`/test/${id}/result`);
          return;
        }

        // Compute duration but DON'T start timer yet — wait for user to click Start
        if (testData.expiresAt) {
          const expireTime = new Date(testData.expiresAt).getTime();
          const remaining = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
          pendingDurationRef.current = remaining;
        } else {
          pendingDurationRef.current = (testData.durationMinutes || 30) * 60;
        }

        // Initialise default answers and per-question language
        const initAnswers = {};
        const initLangs = {};
        testData.questionIds?.forEach((q) => {
          if (q.type === 'DSA') {
            const lang = 'python';
            initLangs[q._id] = lang;
            initAnswers[q._id] = {
              questionId: q._id,
              type: 'DSA',
              code: q.starterCode?.python || DEFAULT_STARTERS.python,
              language: lang,
            };
          } else {
            initAnswers[q._id] = {
              questionId: q._id,
              type: 'MCQ',
              selectedOption: null,
            };
          }
        });
        setAnswers(initAnswers);
        setQLanguage(initLangs);
      } catch (err) {
        console.error('Failed to load test:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndStart();
  }, [id, navigate]);

  // Countdown timer — only runs after user clicks Start
  useEffect(() => {
    if (!testStarted || timeLeftSeconds === null || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, timeLeftSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Called when user clicks "Start Assessment" on the ready screen
  const handleStartTest = () => {
    setTimeLeftSeconds(pendingDurationRef.current);
    setTestStarted(true);
  };

  const formatTimer = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = test?.questionIds?.[currentIndex];
  const currentQId = currentQuestion?._id;
  const currentAnswer = currentQId ? answers[currentQId] : null;
  const currentLang = (currentQId && qLanguage[currentQId]) || 'python';
  const currentRunOutput = currentQId ? runOutputs[currentQId] : null;
  const currentCustomInput = currentQId ? (customInputs[currentQId] || '') : '';

  // Update MCQ answer
  const handleSelectOption = (optIndex) => {
    if (!currentQId) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: {
        ...prev[currentQId],
        questionId: currentQId,
        type: 'MCQ',
        selectedOption: optIndex,
      },
    }));
  };

  // Update DSA code (memoised to avoid Monaco re-renders)
  const handleCodeChange = useCallback((newCode) => {
    if (!currentQId) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: {
        ...prev[currentQId],
        code: newCode || '',
        language: currentLang,
      },
    }));
  }, [currentQId, currentLang]);

  // Switch language + load starter code
  const handleLanguageSwitch = (lang) => {
    if (!currentQId) return;
    setQLanguage((prev) => ({ ...prev, [currentQId]: lang }));
    const starter = currentQuestion?.starterCode?.[lang] || DEFAULT_STARTERS[lang] || '';
    setAnswers((prev) => ({
      ...prev,
      [currentQId]: { ...prev[currentQId], code: starter, language: lang },
    }));
    // Clear output when language changes
    setRunOutputs((prev) => ({ ...prev, [currentQId]: null }));
  };

  // Run code
  const handleRunCode = async () => {
    if (!currentQId) return;
    const code = currentAnswer?.code || '';
    if (!code.trim()) {
      setRunOutputs((prev) => ({ ...prev, [currentQId]: { error: 'Please write some code before running.' } }));
      return;
    }
    setRunningCode(true);
    setRunOutputs((prev) => ({ ...prev, [currentQId]: null }));
    try {
      const stdinInput = currentCustomInput.trim() !== ''
        ? currentCustomInput
        : currentQuestion?.examples?.[0]?.input || '';
      const res = await api.post(`/tests/${id}/run-code`, {
        questionId: currentQId,
        code,
        language: currentLang,
        input: stdinInput,
      });
      setRunOutputs((prev) => ({ ...prev, [currentQId]: res.data.result }));
    } catch (err) {
      setRunOutputs((prev) => ({
        ...prev,
        [currentQId]: { error: err.response?.data?.message || err.message || 'Execution failed', success: false },
      }));
    } finally {
      setRunningCode(false);
    }
  };

  // Submit test
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = Object.values(answers);
      await api.post(`/tests/${id}/submit`, { answers: answersPayload });
      navigate(`/test/${id}/result`);
    } catch (err) {
      console.error('Failed to submit test:', err);
      alert('Failed to submit test. Please check connection and try again.');
      setSubmitting(false);
    }
  };

  // Answer status calculation
  const totalQuestions = test?.questionIds?.length || 0;
  const answeredCount = Object.values(answers).filter((a) => {
    if (a.type === 'MCQ') return a.selectedOption !== null && a.selectedOption !== undefined;
    if (a.type === 'DSA') return a.code && a.code.trim().length > 30;
    return false;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAFAFA]">
        <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-xs font-mono">Preparing assessment environment...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="max-w-xl mx-auto py-16 text-center space-y-3">
          <p className="text-rose-600 font-semibold text-sm">Assessment not found or expired.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Ready Screen ────────────────────────────────────────────────────────────
  if (!testStarted) {
    const durationMins = Math.round((pendingDurationRef.current || 0) / 60);
    const formatBadge = {
      MCQ: { label: 'MCQ Only', icon: FileQuestion, color: 'text-sky-700 bg-sky-50 border-sky-200' },
      DSA: { label: 'Only DSA', icon: Code2, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
      MCQ_DSA: { label: 'MCQ + DSA', icon: Layers, color: 'text-[#0052FF] bg-blue-50 border-blue-200' },
    }[test.testType] || { label: test.testType, icon: FileQuestion, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    const FormatIcon = formatBadge.icon;

    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#0052FF] via-indigo-500 to-purple-500" />

            <div className="p-8 space-y-7">
              {/* Icon + Title */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-[#0052FF]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 font-sans">{test.title}</h1>
                  <p className="text-xs text-slate-500 mt-1">Review the details below before you begin</p>
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Role</p>
                  <p className="text-sm font-bold text-slate-900">{test.role}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Difficulty</p>
                  <p className="text-sm font-bold text-slate-900">{test.difficulty}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Questions</p>
                  <p className="text-sm font-bold text-slate-900">{test.questionIds?.length || 0} Questions</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Duration</p>
                  <p className="text-sm font-bold text-slate-900">{durationMins} minutes</p>
                </div>
              </div>

              {/* Format badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${formatBadge.color}`}>
                  <FormatIcon className="w-3.5 h-3.5" />
                  {formatBadge.label}
                </span>
              </div>

              {/* Rules */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Before you start
                </p>
                <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
                  <li>The timer starts the moment you click <strong>Start Assessment</strong></li>
                  <li>Do not refresh the page — your progress is auto-saved</li>
                  <li>Submitting early is allowed via the Submit button</li>
                </ul>
              </div>

              {/* CTA */}
              <button
                onClick={handleStartTest}
                className="w-full py-3 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                Start Assessment
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-center"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ── End Ready Screen ────────────────────────────────────────────────────────

  const monacoLanguage = LANGUAGES.find((l) => l.value === currentLang)?.monacoLang || 'python';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col selection:bg-[#0052FF] selection:text-white">
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {test.title}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="text-[#0052FF] font-semibold">{test.role}</span>
                <span>•</span>
                <span>{test.difficulty}</span>
                <span>•</span>
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer & Submit */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs ${timeLeftSeconds !== null && timeLeftSeconds < 300
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-white font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Question Selector Palette Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          {test.questionIds.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const qAns = answers[q._id];
            const isAnswered =
              q.type === 'MCQ'
                ? qAns?.selectedOption !== null && qAns?.selectedOption !== undefined
                : qAns?.code && qAns.code.trim().length > 20;

            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer ${isCurrent
                    ? 'bg-[#0052FF] text-white shadow-xs ring-2 ring-[#0052FF]/20'
                    : isAnswered
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentQuestion?.type === 'MCQ' ? (
          /* MCQ Question Layout */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bento-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold font-mono">
                  <FileQuestion className="w-3.5 h-3.5" />
                  Multiple Choice
                </span>

                {currentQuestion.topics?.length > 0 && (
                  <span className="text-xs text-slate-500 font-mono">
                    Topic: {currentQuestion.topics.join(', ')}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-sans">
                  {currentQuestion.title}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((optionText, optIdx) => {
                  const isSelected = currentAnswer?.selectedOption === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3.5 ${isSelected
                          ? 'border-[#0052FF] bg-blue-50/20 ring-1 ring-[#0052FF]/30 text-slate-900 shadow-2xs font-medium'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50/60'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5 ${isSelected
                            ? 'border-[#0052FF] bg-[#0052FF] text-white'
                            : 'border-slate-300 text-slate-500 bg-slate-50'
                          }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed">{optionText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Clear Choice button */}
              {currentAnswer?.selectedOption !== null && currentAnswer?.selectedOption !== undefined && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSelectOption(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear selection</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* DSA Coding Split Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Problem statement & constraints */}
            <div className="lg:col-span-5 bento-card p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold font-mono">
                  <Code2 className="w-3.5 h-3.5" />
                  Algorithm Challenge
                </span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {currentQuestion?.difficulty}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
                  {currentQuestion?.title}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentQuestion?.topics?.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-slate-700 border border-slate-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {currentQuestion?.description}
              </div>

              {/* Constraints */}
              {currentQuestion?.constraints?.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 font-mono">
                    {currentQuestion.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples */}
              {currentQuestion?.examples?.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Examples
                  </h3>
                  {currentQuestion.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs font-mono"
                    >
                      <div>
                        <span className="text-slate-500 font-sans font-semibold">Input: </span>
                        <span className="text-slate-900 font-bold">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-sans font-semibold">Output: </span>
                        <span className="text-emerald-700 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-500 font-sans text-[11px] pt-1 border-t border-slate-200">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Code Workspace & Terminal */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bento-card overflow-hidden">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700 font-mono">Language:</span>
                    <select
                      value={currentLang}
                      onChange={(e) => handleLanguageSwitch(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-900 text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0052FF] cursor-pointer shadow-2xs font-mono"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleRunCode}
                    disabled={runningCode}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {runningCode ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{runningCode ? 'Executing…' : 'Run Code'}</span>
                  </button>
                </div>

                {/* Monaco Code Editor (dark frame for IDE clarity) */}
                <div className="h-80 bg-[#1E1E1E]">
                  <Editor
                    key={`${currentQId}-${currentLang}`}
                    height="100%"
                    language={monacoLanguage}
                    theme="vs-dark"
                    value={currentAnswer?.code || DEFAULT_STARTERS[currentLang] || ''}
                    onChange={handleCodeChange}
                    options={MONACO_OPTIONS}
                  />
                </div>

                {/* Custom Stdin */}
                <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Custom stdin (optional):
                  </label>
                  <input
                    type="text"
                    value={currentCustomInput}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({ ...prev, [currentQId]: e.target.value }))
                    }
                    placeholder={currentQuestion?.examples?.[0]?.input || 'e.g. 5 10 20'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* Run Output Terminal */}
                {currentRunOutput && (
                  <div className="m-3.5 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold font-mono">
                        <Terminal className="w-3.5 h-3.5 text-[#0052FF]" />
                        <span>Execution Output</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${currentRunOutput.success
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                        >
                          {currentRunOutput.success ? '✓ Passed (Exit 0)' : '✗ Error / Timeout'}
                        </span>
                        <button
                          onClick={() => setRunOutputs((prev) => ({ ...prev, [currentQId]: null }))}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 space-y-2.5 max-h-48 overflow-y-auto bg-slate-950 text-slate-100 font-mono">
                      {currentRunOutput.stdout && (
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                            stdout:
                          </div>
                          <pre className="text-xs text-emerald-300 whitespace-pre-wrap">
                            {currentRunOutput.stdout}
                          </pre>
                        </div>
                      )}
                      {(currentRunOutput.stderr || currentRunOutput.error) && (
                        <div>
                          <div className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold mb-1">
                            stderr / error:
                          </div>
                          <pre className="text-xs text-rose-400 whitespace-pre-wrap">
                            {currentRunOutput.stderr || currentRunOutput.error}
                          </pre>
                        </div>
                      )}
                      {currentRunOutput.execution_time_ms !== undefined && (
                        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                          Execution time: {currentRunOutput.execution_time_ms}ms
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 z-30 bg-white/90 border-t border-slate-200 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-600 font-mono">
            Answered <strong className="text-emerald-700">{answeredCount}</strong> of{' '}
            <strong className="text-slate-900">{totalQuestions}</strong>
          </div>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish & Submit</span>
            </button>
          )}
        </div>
      </footer>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Submit Assessment?
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You have answered <strong className="text-emerald-700 font-mono">{answeredCount}</strong> out of{' '}
              <strong className="text-slate-900 font-mono">{totalQuestions}</strong> questions. Once submitted, your answers will be automatically evaluated by the assessment engine.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Continue Assessment
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Grading Assessment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
