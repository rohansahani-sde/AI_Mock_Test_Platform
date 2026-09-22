import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  Clock,
  Code2,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  FileQuestion,
  BarChart3,
  RefreshCw,
  Plus,
  Terminal,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tests/my-tests');
      setTests(res.data.tests || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const completedTests = tests.filter((t) => t.status === 'SUBMITTED');
  const avgScore =
    completedTests.length > 0
      ? Math.round(
        completedTests.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
        completedTests.length
      )
      : 0;

  const getDifficultyBadge = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getFormatBadge = (type) => {
    switch (type) {
      case 'MCQ':
        return { label: 'MCQ Only', icon: FileQuestion, color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'DSA':
        return { label: 'Only DSA', icon: Code2, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'MCQ_DSA':
        return { label: 'MCQ + DSA', icon: Layers, color: 'text-[#0052FF] bg-blue-50 border-blue-200' };
      default:
        return { label: type, icon: FileQuestion, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hero Bento Card */}
      <div className="bento-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052FF] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
              <span>Engineering Assessment Studio</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              Ready to evaluate, {user?.name?.split(' ')[0] || 'Engineer'}?
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
              Synthesize role-calibrated technical assessments spanning algorithm problem-solving,
              system concepts, and live code execution under real interview constraints.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative mesh grid */}
        <div className="absolute right-0 top-0 w-96 h-full bg-subtle-grid opacity-30 pointer-events-none"></div>
      </div>

      {/* Metrics Row (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total */}
        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Created
            </p>
            <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {tests.length}
            </p>
            <span className="inline-block text-[11px] font-medium text-slate-500">
              Technical sessions recorded
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <FileQuestion className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Completed */}
        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </p>
            <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {completedTests.length}
            </p>
            <span className="inline-block text-[11px] font-medium text-emerald-700">
              {tests.length > 0
                ? `${Math.round((completedTests.length / tests.length) * 100)}% completion rate`
                : 'Awaiting first test'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Avg Score */}
        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Score
            </p>
            <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {completedTests.length > 0 ? `${avgScore}%` : '—'}
            </p>
            <span className="inline-block text-[11px] font-medium text-blue-700">
              {completedTests.length > 0
                ? avgScore >= 70
                  ? 'Strong benchmark level'
                  : 'Practice recommended'
                : 'Take test to calibrate'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052FF]">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
              Recent Assessments
            </h2>
            <p className="text-xs text-slate-500">
              Manage your technical interview history, review feedback, or resume sessions
            </p>
          </div>

          <button
            onClick={fetchTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          /* Bento Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bento-card p-5 space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-5 w-16 bg-slate-100 rounded-md" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          /* Empty State */
          <div className="bento-card py-16 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto">
              <Terminal className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">No mock assessments yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate an engineering assessment tailored to your preferred role, difficulty bar, and coding format.
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First Assessment</span>
            </Link>
          </div>
        ) : (
          /* Assessment Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => {
              const formatInfo = getFormatBadge(test.testType);
              const FormatIcon = formatInfo.icon;
              const isSubmitted = test.status === 'SUBMITTED';

              return (
                <div
                  key={test.id}
                  className="bento-card p-5 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${formatInfo.color}`}
                      >
                        <FormatIcon className="w-3 h-3" />
                        {formatInfo.label}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider font-mono ${getDifficultyBadge(
                          test.difficulty
                        )}`}
                      >
                        {test.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-[#0052FF] transition-colors">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{test.role}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{test.durationMinutes}m duration</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <div>
                      {isSubmitted ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold font-mono text-slate-900">
                            {test.percentage}%
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ({test.score}/{test.totalScore} pts)
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md border ${test.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                        >
                          {test.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                        </span>
                      )}
                    </div>

                    <div>
                      {isSubmitted ? (
                        <Link
                          to={`/test/${test.id}/result`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-[#0052FF]" />
                          <span>Review</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/test/${test.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>{test.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
