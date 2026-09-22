import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import CreateTest from './pages/CreateTest';
import TakeTest from './pages/TakeTest';
import TestResult from './pages/TestResult';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col antialiased selection:bg-[#0052FF] selection:text-white">
          <Navbar />
          <div className="">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test/:id"
                element={
                  <ProtectedRoute>
                    <TakeTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test/:id/result"
                element={
                  <ProtectedRoute>
                    <TestResult />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
