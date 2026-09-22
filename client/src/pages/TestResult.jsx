import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Code2,
  FileQuestion,
  LayoutDashboard,
  RotateCcw,
  AlertCircle,
  Terminal,
} from 'lucide-react';

export default function TestResult() {
  const { id } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tests/${id}/result`);
        setResultData(res.data.result);
      } catch (err) {
        console.error('Failed to fetch test result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-xs">Evaluating and loading assessment breakdown...</p>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Assessment Result Available</h2>
        <p className="text-xs text-slate-500">
          This assessment hasn't been submitted yet or could not be found.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0052FF] text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { test, attempt, questions } = resultData;
  const isPassed = attempt.percentage >= 70;

  const mcqQuestions = questions.filter((q) => q.type === 'MCQ');
  const dsaQuestions = questions.filter((q) => q.type === 'DSA');

  const mcqCorrect = mcqQuestions.filter((q) => q.userAnswer?.isCorrect).length;
  const dsaPassed = dsaQuestions.filter((q) => q.userAnswer?.isCorrect).length;

  const filteredQuestions =
    activeTab === 'mcq'
      ? mcqQuestions
      : activeTab === 'dsa'
        ? dsaQuestions
        : questions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Score Banner Hero (Bento Card) */}
      <div className="bento-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPassed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
              >
                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                {isPassed ? 'Performance Qualified' : 'Completed — Needs Practice'}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {test.difficulty}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl text-slate-900 tracking-tight font-normal">
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Role: <strong className="text-slate-900">{test.role}</strong> • Format:{' '}
              <strong className="text-slate-900">{test.testType.replace('_', ' + ')}</strong>
            </p>
          </div>

          {/* Big Score Radial Badge */}
          <div className="flex items-center gap-6 self-start md:self-center">
            <div className="text-left md:text-right">
              <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-900">
                {attempt.percentage}%
              </div>
              <div className="text-xs font-mono font-semibold text-slate-500 mt-1">
                Score: {attempt.score} / {attempt.totalScore} Points
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative mesh grid */}
        <div className="absolute right-0 top-0 w-80 h-full bg-subtle-grid opacity-30 pointer-events-none"></div>
      </div>

      {/* Metrics Row (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              MCQ Accuracy
            </p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {mcqQuestions.length > 0 ? `${mcqCorrect} / ${mcqQuestions.length} Correct` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              DSA Solved
            </p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {dsaQuestions.length > 0 ? `${dsaPassed} / ${dsaQuestions.length} Solved` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="bento-card p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052FF] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Session Time
            </p>
            <p className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {test.durationMinutes} Minutes
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Assessment</span>
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Detailed Analysis Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
              Question Review & Explanations
            </h2>
            <p className="text-xs text-slate-500">
              Granular evaluation of answers, test cases, and diagnostic guidance
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-colors ${activeTab === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All ({questions.length})
            </button>
            {mcqQuestions.length > 0 && (
              <button
                onClick={() => setActiveTab('mcq')}
                className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-colors ${activeTab === 'mcq'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                MCQ ({mcqQuestions.length})
              </button>
            )}
            {dsaQuestions.length > 0 && (
              <button
                onClick={() => setActiveTab('dsa')}
                className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-colors ${activeTab === 'dsa'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                DSA ({dsaQuestions.length})
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isMcq = q.type === 'MCQ';
            const userAns = q.userAnswer || {};
            const isCorrect = userAns.isCorrect;

            return (
              <div
                key={q.id || idx}
                className="bento-card p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">Q{idx + 1}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${isMcq
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                      >
                        {isMcq ? 'Multiple Choice' : 'Algorithm'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {q.difficulty} • {userAns.points || 0} pts
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-1 font-sans">
                      {q.title}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold font-mono">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {isMcq ? (
                  /* MCQ Options and Explanations */
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      {q.options?.map((opt, optIdx) => {
                        const isUserChoice = userAns.selectedOption === optIdx;
                        const isCorrectOption = q.correctAnswer === optIdx;

                        let optionStyle =
                          'border-slate-200 bg-white text-slate-600';

                        if (isCorrectOption) {
                          optionStyle =
                            'border-emerald-400 bg-emerald-50/60 text-emerald-900 font-medium';
                        } else if (isUserChoice && !isCorrectOption) {
                          optionStyle =
                            'border-rose-400 bg-rose-50/60 text-rose-900 font-medium';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${optionStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold font-mono">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isUserChoice && (
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                  Your Choice
                                </span>
                              )}
                              {isCorrectOption && (
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Card */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-700 leading-relaxed space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-[#0052FF] font-mono">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Evaluation Rationale</span>
                        </div>
                        <p className="text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* DSA Code Review */
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                      {q.description}
                    </p>

                    <div>
                      <div className="text-xs font-semibold text-slate-700 font-mono mb-1.5">
                        Submitted Code:
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 overflow-x-auto max-h-56">
                        {userAns.code || '# No code was submitted for this question.'}
                      </pre>
                    </div>

                    {userAns.executionResult && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                        <div className="font-bold text-slate-800">
                          Automated Test Verification:
                        </div>
                        <p className="text-slate-600">
                          Passed {userAns.executionResult.passed || 0} of{' '}
                          {userAns.executionResult.total || 0} test cases.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
