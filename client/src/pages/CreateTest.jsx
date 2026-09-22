import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Cpu,
  Code2,
  Layers,
  Server,
  Layout,
  Database,
  CheckCircle2,
  Clock,
  FileQuestion,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Terminal,
  Sparkles,
  Check,
} from 'lucide-react';

const ROLES = [
  {
    id: 'AI Engineer',
    title: 'AI Engineer',
    description: 'LLMs, PyTorch, Model fine-tuning, ML pipelines & Python fundamentals',
    icon: Cpu,
  },
  {
    id: 'Software Engineer',
    title: 'Software Engineer',
    description: 'Data structures, algorithms, system design, OOP & CS foundations',
    icon: Code2,
  },
  {
    id: 'Full Stack',
    title: 'Full Stack Developer',
    description: 'React, Node.js, Express, databases, REST APIs & architecture',
    icon: Layers,
  },
  {
    id: 'Backend Developer',
    title: 'Backend Developer',
    description: 'High throughput services, database queries, concurrency & microservices',
    icon: Server,
  },
  {
    id: 'Frontend Developer',
    title: 'Frontend Developer',
    description: 'Modern React, state machines, DOM performance & responsive layouts',
    icon: Layout,
  },
  {
    id: 'Data Scientist',
    title: 'Data Scientist',
    description: 'Statistical inference, Pandas, NumPy, predictive modeling & analytics',
    icon: Database,
  },
];

const DIFFICULTIES = [
  {
    id: 'EASY',
    title: 'Easy',
    badge: 'Foundational',
    desc: 'Core syntax, fundamental algorithms, and direct concept applications.',
    color: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    selectedStyle: 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500/20',
  },
  {
    id: 'MEDIUM',
    title: 'Medium',
    badge: 'Industry Standard',
    desc: 'Typical tech interview bar with trade-offs, edge cases, and optimization.',
    color: 'border-amber-200 text-amber-700 bg-amber-50',
    selectedStyle: 'border-amber-600 bg-amber-50/30 ring-1 ring-amber-500/20',
  },
  {
    id: 'HARD',
    title: 'Hard',
    badge: 'Senior / Staff Bar',
    desc: 'Complex algorithms, heavy constraints, tricky logic, and deep system architecture.',
    color: 'border-rose-200 text-rose-700 bg-rose-50',
    selectedStyle: 'border-rose-600 bg-rose-50/30 ring-1 ring-rose-500/20',
  },
];

const FORMATS = [
  {
    id: 'MCQ',
    title: 'MCQ Only',
    badge: 'Speed & Concept Check',
    desc: '5 multiple choice questions testing theoretical understanding, debugging, and language trivia.',
    details: '5 Questions • ~15 mins',
    icon: FileQuestion,
  },
  {
    id: 'MCQ_DSA',
    title: 'MCQ + DSA',
    badge: 'Comprehensive Interview',
    desc: '5 conceptual MCQs followed by 2 real coding algorithmic challenges with live code runner.',
    details: '7 Questions (5 MCQ + 2 DSA) • ~50 mins',
    icon: Layers,
  },
  {
    id: 'DSA',
    title: 'Only DSA',
    badge: 'Coding Round Simulation',
    desc: '3 algorithmic problems focused purely on problem solving, runtime constraints, and hidden tests.',
    details: '3 DSA Questions • ~60 mins',
    icon: Code2,
  },
];

const STEPS = [
  { step: 1, label: 'Role' },
  { step: 2, label: 'Difficulty' },
  { step: 3, label: 'Test Type' },
];

export default function CreateTest() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [role, setRole] = useState('AI Engineer');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [format, setFormat] = useState('MCQ_DSA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generationStep, setGenerationStep] = useState(0);

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 3200);

    try {
      const payload = {
        role,
        difficulty,
        type: format,
      };

      const res = await api.post('/tests/generate', payload);
      clearInterval(stepInterval);
      const testId = res.data.test.id;
      navigate(`/test/${testId}`);
    } catch (err) {
      clearInterval(stepInterval);
      console.error('Failed to generate test:', err);
      setError(
        err.response?.data?.message ||
        'Failed to generate test questions. Please check connection and try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052FF] text-xs font-semibold">
          <Terminal className="w-3.5 h-3.5 stroke-[2]" />
          <span>Assessment Synthesis</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight">
          Create AI Mock Assessment
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Calibrate the technical focus, problem complexity, and format of your simulation.
        </p>
      </div>

      {/* Stepper Progress Bar: Role -> Difficulty -> Test Type */}
      <div className="bento-card p-4 sm:p-5">
        <div className="flex items-center justify-between relative">
          {STEPS.map((s, idx) => {
            const isCompleted = activeStep > s.step;
            const isCurrent = activeStep === s.step;

            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${isCurrent
                        ? 'bg-[#0052FF] text-white shadow-xs'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 group-hover:border-slate-300'
                      }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                  </div>
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-semibold transition-colors ${isCurrent
                          ? 'text-[#0052FF]'
                          : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[11px] text-slate-400 hidden sm:block">
                      {s.step === 1 ? role : s.step === 2 ? difficulty : format.replace('_', ' + ')}
                    </p>
                  </div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${activeStep > idx + 1 ? 'bg-emerald-300' : 'bg-slate-200'
                      }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs sm:text-sm text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content Panels */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: Select Target Role</h2>
              <p className="text-xs text-slate-500">Pick the specialization for the assessment</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${isSelected
                      ? 'border-[#0052FF] bg-blue-50/20 ring-2 ring-[#0052FF]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected
                          ? 'bg-[#0052FF] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Difficulty Level</h2>
              <p className="text-xs text-slate-500">Choose the standard of algorithmic challenge</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">2 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIFFICULTIES.map((d) => {
              const isSelected = difficulty === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`cursor-pointer p-5 rounded-xl border transition-all flex flex-col justify-between gap-3.5 ${isSelected
                      ? d.selectedStyle
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${d.color}`}
                    >
                      {d.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-slate-900" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Test Type</h2>
              <p className="text-xs text-slate-500">Select structure of questions and format</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">3 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const isSelected = format === f.id;

              return (
                <div
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`cursor-pointer p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${isSelected
                      ? 'border-[#0052FF] bg-blue-50/20 ring-2 ring-[#0052FF]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected
                          ? 'bg-[#0052FF] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#0052FF]">
                      {f.badge}
                    </span>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.details}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stepper Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Target:</span>
          <strong className="text-slate-900">{role}</strong>
          <span>•</span>
          <strong className="text-slate-900">{difficulty}</strong>
          <span>•</span>
          <strong className="text-slate-900">{format.replace('_', ' + ')}</strong>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => prev - 1)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => prev + 1)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs sm:text-sm font-semibold shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Assessment...</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" />
                  <span>Generate Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Generation Loader Modal (Clean Developer UI) */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0052FF] flex items-center justify-center mx-auto">
              <Terminal className="w-6 h-6 stroke-[2.2] animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Synthesizing Technical Assessment</h3>
              <p className="text-xs text-slate-500">
                Generating calibrated test cases and evaluation criteria for {role}...
              </p>
            </div>

            <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${generationStep >= 1 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                />
                <span>Analyzing {role} competency matrix</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${generationStep >= 2 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                />
                <span>Generating {difficulty.toLowerCase()} complexity problems</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${generationStep >= 3 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                />
                <span>Configuring starter code & execution harness</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
