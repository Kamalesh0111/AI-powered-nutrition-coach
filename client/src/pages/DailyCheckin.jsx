import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import FeedbackForm from '../components/FeedbackForm'; // Corrected default import
import apiClient from '../api/apiclient';

// A simple success icon component
const CheckCircleIcon = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DailyCheckin = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmitFeedback = async (feedbackData) => {
        setIsSubmitting(true);
        setError('');
        try {
            // This is the real API call to your backend.
            await apiClient.post('/feedback', feedbackData);

            setIsSuccess(true);

            // Redirect back to the dashboard after a short delay to show the success message.
            setTimeout(() => {
                navigate('/dashboard');
            }, 2500);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            console.error(err);
        } finally {
            // This will run regardless of success or failure.
            // We keep it true on success so the button remains disabled.
            if (!isSuccess) {
                 setIsSubmitting(false);
            }
        }
    };

    // Render a success screen after submission is complete.
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg animate-fade-in">
                    <CheckCircleIcon />
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Thank You!</h2>
                    <p className="text-gray-600 mt-2">Your feedback has been saved.</p>
                    <p className="text-gray-600">Your plan will be adjusted for tomorrow.</p>
                </div>
            </div>
        );
    }

    // Render the feedback form.
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
            <FeedbackForm
                onSubmit={handleSubmitFeedback}
                isSubmitting={isSubmitting}
                error={error} // Pass the error message down to the form component
            />
        </div>
    );
};

DailyCheckin.propTypes = {
    // This component doesn't receive any props from the router.
};

export default DailyCheckin;

