import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Terminal,
  Cpu,
  Code2,
  Layers,
  Server,
  Layout,
  Database,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Award,
  Check,
  FileQuestion,
  ChevronRight,
  Compass,
  Star,
} from 'lucide-react';

const ROLES = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    badge: 'LLMs & Machine Learning',
    description: 'PyTorch, Model fine-tuning, RAG architectures, prompt pipelines & Python algorithmic benchmarks.',
    icon: Cpu,
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-[#0052FF]',
    activeBg: 'bg-blue-50 border-[#0052FF]',
    sampleQ: 'Implement a Token Bucket Rate Limiter for an LLM inference service with burst allowance.',
    tags: ['Python', 'PyTorch', 'Vector Search', 'RAG'],
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    badge: 'Core CS & Algorithms',
    description: 'Data structures, dynamic programming, algorithmic complexity, graph traversal, and clean OOP principles.',
    icon: Code2,
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-600',
    activeBg: 'bg-emerald-50 border-emerald-500',
    sampleQ: 'Find the maximum path sum in a binary tree with negative weights in O(N) time.',
    tags: ['Algorithms', 'Data Structures', 'DP', 'Graphs'],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    badge: 'End-to-End Architecture',
    description: 'React, Node.js, Express, relational & document databases, authentication flows, and scalable REST APIs.',
    icon: Layers,
    color: 'from-indigo-500/10 to-violet-500/10 border-indigo-200 text-indigo-600',
    activeBg: 'bg-indigo-50 border-indigo-500',
    sampleQ: 'Design a distributed optimistic locking mechanism for concurrent inventory updates.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'APIs'],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    badge: 'Distributed Systems',
    description: 'High-throughput microservices, concurrency models, query optimization, caching strategies, and message queues.',
    icon: Server,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-600',
    activeBg: 'bg-amber-50 border-amber-500',
    sampleQ: 'Implement a write-ahead log indexing strategy with sub-millisecond recovery guarantees.',
    tags: ['Go / Java', 'Redis', 'Kafka', 'Concurrency'],
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    badge: 'Modern UI Engineering',
    description: 'Advanced React patterns, state management, DOM reconciliation, render pipelines, and responsive micro-interactions.',
    icon: Layout,
    color: 'from-pink-500/10 to-rose-500/10 border-pink-200 text-pink-600',
    activeBg: 'bg-pink-50 border-pink-500',
    sampleQ: 'Build a virtualized list component supporting dynamic row heights and smooth 60fps scrolling.',
    tags: ['React 19', 'TypeScript', 'Web Perf', 'CSS'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    badge: 'Statistical Inference',
    description: 'Pandas, NumPy, statistical hypothesis testing, machine learning estimators, and feature engineering.',
    icon: Database,
    color: 'from-cyan-500/10 to-sky-500/10 border-cyan-200 text-cyan-600',
    activeBg: 'bg-cyan-50 border-cyan-500',
    sampleQ: 'Calculate AUC-ROC score from scratch given true labels and raw predicted probability distributions.',
    tags: ['NumPy', 'Pandas', 'Statistics', 'Scikit-learn'],
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Groq 120B Question Synthesis',
    description:
      'Never get memorized questions. Every assessment is dynamically synthesized with calibrated edge cases, constraints, and starter code.',
  },
  {
    icon: Code2,
    title: 'Live Monaco Code Runner',
    description:
      'Write, debug, and execute Python, JavaScript, Java, and C++ directly in your browser with real standard input and instant terminal feedback.',
  },
  {
    icon: ShieldCheck,
    title: 'Hidden Test Case Validation',
    description:
      'Automatic grading checks your code against hidden test cases with strict timeout protections and memory boundary constraints.',
  },
  {
    icon: Clock,
    title: 'Pre-Flight Ready Screen',
    description:
      'Review role scope, question count, and rules before the clock ticks. Distraction-free full screen mode ensures authentic interview pressure.',
  },
  {
    icon: BarChart3,
    title: 'Granular Performance Analytics',
    description:
      'Receive instant score breakdowns, test case pass rates, execution runtime profiles, and personalized improvement guidance.',
  },
  {
    icon: Award,
    title: 'Role-Specific Benchmarking',
    description:
      'Measure your skill against calibrated Easy, Medium, and Senior/Staff difficulty standards used by top engineering teams.',
  },
];

const CODE_DEMO_CODE = `# Write your solution here
def maxPathSum(root):
    max_val = float('-inf')
    
    def dfs(node):
        nonlocal max_val
        if not node:
            return 0
        left = max(0, dfs(node.left))
        right = max(0, dfs(node.right))
        max_val = max(max_val, left + right + node.val)
        return node.val + max(left, right)
        
    dfs(root)
    return max_val`;

export default function Landing() {
  const { user } = useAuth();
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const activeRole = ROLES[selectedRoleIndex];

  return (
    <div className="bg-[#FAFAFA] text-[#0F172A] selection:bg-[#0052FF] selection:text-white">
      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-subtle-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">MockTest PRO Studio</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-[#0052FF] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Groq 120B Calibrated
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl text-slate-900 tracking-tight leading-[1.1] font-normal">
              Master the engineering interview before you walk in.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-sans">
              Generate role-calibrated technical assessments spanning algorithm problem-solving,
              system architecture MCQs, and live code execution under real interview constraints.
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] active:scale-[0.99] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] active:scale-[0.99] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Start Free Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-2xs transition-all"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Proof Metrics */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>6 Specialized Tech Tracks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Python, JS, Java & C++</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Instant Auto-Grading</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Product Sandbox Showcase ───────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0052FF]">
              Real IDE Simulation
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              A distraction-free interview studio.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Authentic coding challenges with Monaco IDE, custom standard input, and real-time execution feedback.
            </p>
          </div>

          {/* IDE Simulation Bento Card */}
          <div className="bento-card overflow-hidden shadow-xl border border-slate-300/80 bg-white">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-3 text-slate-300 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#0052FF]" />
                  assessment_workspace.py
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                  ● Ready
                </span>
                <span className="text-slate-400 hidden sm:inline">Python 3.11</span>
              </div>
            </div>

            {/* Split Screen Mock IDE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Problem Pane */}
              <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold font-mono">
                    <Code2 className="w-3 h-3" />
                    Problem 02 of 07
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold font-mono">
                    MEDIUM
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Binary Tree Maximum Path Sum
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    A <strong>path</strong> in a binary tree is a sequence of nodes where each pair of adjacent nodes
                    in the sequence has an edge connecting them. Return the <em>maximum path sum</em> of any non-empty path.
                  </p>
                </div>

                {/* Example box */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Sample Test Case:</div>
                  <div>
                    <span className="text-slate-500">Input: </span>
                    <span className="font-bold text-slate-900">root = [-10, 9, 20, null, null, 15, 7]</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Output: </span>
                    <span className="font-bold text-emerald-600">42 (15 + 20 + 7)</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time Limit: 2.0s • Memory: 256MB</span>
                </div>
              </div>

              {/* Code Editor Pane */}
              <div className="lg:col-span-7 flex flex-col bg-[#1E1E1E] text-slate-200">
                <div className="p-4 flex-1 font-mono text-xs leading-relaxed overflow-x-auto selection:bg-[#0052FF]">
                  <pre className="text-slate-300">
                    <code>{CODE_DEMO_CODE}</code>
                  </pre>
                </div>

                {/* Simulated Output Drawer */}
                <div className="border-t border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold text-[11px]">
                      ✓ 3/3 Hidden Test Cases Passed
                    </span>
                    <span className="text-slate-500 hidden sm:inline">Execution time: 38ms</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Role Tracks Matrix ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0052FF]">
              Targeted Specializations
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              Calibrated for your specific engineering role.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Select your domain to see tailored algorithm problems and architecture trivia.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((r, idx) => {
              const Icon = r.icon;
              const isSelected = selectedRoleIndex === idx;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleIndex(idx)}
                  className={`bento-card-interactive p-6 space-y-4 flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-[#0052FF] border-transparent bg-white shadow-md' : 'bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${r.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {r.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{r.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={user ? '/create' : '/register'}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052FF] hover:text-[#0047E0] transition-colors group"
                    >
                      <span>Simulate {r.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. How It Works ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0052FF]">
              Evaluation Workflow
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              How MockTest simulates reality.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Three seamless steps from configuration to actionable benchmark feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bento-card p-6 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#0052FF] font-mono font-bold text-xs flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Configure Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your target role (e.g. AI Engineer, Full Stack), select the bar (Easy, Medium, Hard),
                and choose between MCQ-only, DSA-only, or the comprehensive hybrid format.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bento-card p-6 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#0052FF] font-mono font-bold text-xs flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Pre-Flight & Live Execution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review the test rules on the pre-flight screen. Once you click Start, the clock begins,
                the navbar vanishes into focus mode, and you code in a real Monaco editor.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bento-card p-6 space-y-4 relative">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#0052FF] font-mono font-bold text-xs flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Grading & Score Archival</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answers and algorithm solutions are submitted to our evaluation engine, graded against hidden
                tests, and archived to your personal dashboard to track growth over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Features Bento Grid ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0052FF]">
              Engineered For Excellence
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-slate-900 tracking-tight font-normal">
              Every detail built for realistic practice.
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              No toy questions. No fake timers. Pure technical evaluation built by engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="bento-card p-6 space-y-3 bg-white">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-[#0052FF] flex items-center justify-center shadow-2xs">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Bottom High-Impact CTA ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bento-card p-8 sm:p-14 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#002D8C] text-white shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/90">
              <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>Zero setup required • Generates in seconds</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-tight text-white max-w-2xl mx-auto">
              Ready to benchmark your technical readiness?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Start practicing with realistic questions calibrated to actual engineering hiring loops.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={user ? '/create' : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0052FF] hover:bg-[#0047E0] active:scale-[0.99] text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{user ? 'Create New Assessment' : 'Synthesize Your First Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Modern Developer Footer ────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0052FF] flex items-center justify-center text-white shadow-xs">
              <Terminal className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">MockTest PRO</span>
            <span className="text-[10px] font-mono text-slate-400">v1.0</span>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            Powered by React 19, FastAPI, Express & Groq LLM
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to={user ? '/dashboard' : '/login'} className="hover:text-slate-900 transition-colors">
              {user ? 'Dashboard' : 'Sign In'}
            </Link>
            <span>•</span>
            <Link to={user ? '/create' : '/register'} className="hover:text-slate-900 transition-colors">
              New Test
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
