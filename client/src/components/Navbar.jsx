import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Plus, LogOut, User, Terminal } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar during active test sessions (take test + result pages)
  const isTestPage = location.pathname.startsWith('/test/');
  if (isTestPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight font-sans">
                MockTest
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-[#0052FF] border border-blue-200/60">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5">
              Engineering Assessment Studio
            </span>
          </div>
        </Link>

        {/* Navigation Links (Logged In vs Public) */}
        {user ? (
          <>
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  location.pathname === '/dashboard' || location.pathname === '/'
                    ? 'bg-slate-100 text-slate-900 border border-slate-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/create"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  location.pathname === '/create'
                    ? 'bg-[#0052FF] text-white shadow-sm'
                    : 'bg-[#0052FF] hover:bg-[#0047E0] text-white shadow-xs hover:shadow-sm'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Assessment</span>
              </Link>
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[140px] truncate">{user.name || user.email}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
