import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '../components/OnboardingForm';
import apiClient from '../api/apiclient';
import { useAuth } from '../hooks/useAuth';

const OnboardingPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: isAuthLoading, logout, refreshUserSession } = useAuth();
    const userName = user?.email?.split('@')[0] || 'User';

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isAuthLoading, navigate]);

    const handleOnboardingSubmit = async (profileData) => {
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient.post('/users/register', profileData);
            await refreshUserSession();
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    
    if (isAuthLoading) {
        return (
             <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-indigo-300 to-purple-400 flex flex-col justify-center items-center p-4">
             <header className="absolute top-0 right-0 p-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Hello, {userName}</span>
                <button onClick={handleLogout} className="text-sm font-medium text-sky-600 hover:underline">
                    Logout
                </button>
            </header>
            <OnboardingForm onSubmit={handleOnboardingSubmit} isSubmitting={isSubmitting} />
            {error && <p className="text-red-500 text-sm mt-4 max-w-md text-center">{error}</p>}
        </div>
    );
};

export default OnboardingPage;

