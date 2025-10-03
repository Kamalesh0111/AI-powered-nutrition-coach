/**
 * The root component that defines the application's layout and routing structure.
 * It uses React Router to render different pages based on the URL.
 */
import React from 'react';
// FIX: Import the 'Link' component from react-router-dom
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Import Page Components & Router Utilities
import ProtectedRoute from './router/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyCheckin from './pages/DailyCheckin';
import Onboarding from './pages/Onboarding';

/**
 * A fallback component for any routes that are not matched.
 */
const NotFoundPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-50 flex flex-col justify-center items-center text-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl border border-slate-200">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">404</h1>
            <h2 className="mt-4 text-2xl font-semibold text-slate-800">Page Not Found</h2>
            <p className="mt-2 text-slate-600">
                Sorry, we couldn't find the page you're looking for.
            </p>
            <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-300"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go back to Dashboard
            </Link>
        </div>
    </div>
);


/**
 * The main App component that sets up all the application routes.
 */
const App = () => {
    return (
<div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-300">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Redirect root path to the login screen */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Protected Routes (Routes that require a user to be logged in) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/checkin" element={<DailyCheckin />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                </Route>

                {/* 404 Not Found Fallback */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
};

export default App;