import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabaseClient'; // Import the Supabase client
import { useAuth } from '../hooks/useAuth'; // Import our auth hook

// A simple loader for the auth check
const AuthLoader = () => (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // State to show success message
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    // Redirect authenticated users away from the register page
    useEffect(() => {
        if (isAuthenticated && !isAuthLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isAuthLoading, navigate]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // Supabase enforces password length on the server, but client-side check is good UX.
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);
        try {
            // This is the REAL registration call using the Supabase client library.
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (signUpError) {
                throw signUpError; // Throw the error to be caught by the catch block
            }

            setIsSuccess(true); // Show the success message

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Show a loader while checking for an existing session
    if (isAuthLoading) {
        return <AuthLoader />;
    }

    // After successful registration, show a confirmation message instead of the form.
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center py-12 px-4">
                <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg text-center">
                     <h2 className="text-2xl font-bold text-green-600">Registration Successful!</h2>
                     <p className="text-gray-600 mt-4">
                        Please check your email inbox for a confirmation link to activate your account.
                     </p>
                      <Link to="/login" className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-500">
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-300 via-indigo-300 to-purple-400 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
             <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-800 font-sans tracking-wider drop-shadow-xl">
                WELCOME TO AI-POWERED DIET PLATFORM
            </h1>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-600">{error}</p>}

                        <div>
                            <button type="submit" disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-wait">
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

Register.propTypes = {
    // No props passed from router
};

export default Register;

