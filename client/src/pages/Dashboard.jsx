import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MealPlanCard from '../components/MealPlanCard';
import FeedbackForm from '../components/FeedbackForm';
import apiClient from '../api/apiclient';
import { useAuth } from '../hooks/useAuth';

// --- Helper Components ---
const Loader = () => ( 
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-50 flex justify-center items-center">
        <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-slate-200 opacity-20"></div>
        </div>
    </div> 
);

const LogOutIcon = () => ( 
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg> 
);

const StreakIcon = () => ( 
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg> 
);

const AccordionItem = ({ day, date, plan, onMealToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-slate-100 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {day}
                    </div>
                    <span className="font-semibold text-slate-800">{date}</span>
                </div>
                <svg className={`w-5 h-5 text-sky-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white border-t border-slate-200">
                    <MealPlanCard plan={plan.plan_data} completedMeals={plan.completed_meals} onMealToggle={(mealName, isCompleted) => onMealToggle(plan.id, mealName, isCompleted)} />
                </div>
            )}
        </div>
    );
};

const ConfirmationModal = ({ title, message, onConfirm, onCancel, isConfirming, confirmText }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in-fast backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all">
            <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{message}</p>
            <div className="mt-8 flex justify-end space-x-3">
                <button onClick={onCancel} disabled={isConfirming} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50">
                    No
                </button>
                <button onClick={onConfirm} disabled={isConfirming} className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${confirmText.includes("Delete") ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"} disabled:opacity-50`}>
                    {isConfirming ? 'Working...' : confirmText}
                </button>
            </div>
        </div>
    </div>
);

// --- New Stats Components ---
const StatCard = ({ title, value, unit, children }) => (
    <div className="bg-gradient-to-br from-rose-200 via-orange-200 to-pink-100 p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-start border border-slate-100 hover:border-sky-200">
        <div className="p-3 bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 rounded-xl mr-4 shadow-sm">
            {children}
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
        </div>
    </div>
);

const estimateGoalTimeline = (goal, weight) => {
    if (!goal || !weight) return "N/A";
    switch (goal) {
        case "Weight Loss":
            const targetLoss = weight * 0.1;
            const weeksToLose = Math.round(targetLoss / 0.5);
            return `~${weeksToLose} weeks`;
        case "Muscle Gain":
            const targetGain = 5;
            const weeksToGain = Math.round(targetGain / 0.25);
            return `~${weeksToGain} weeks`;
        case "Bodybuilding":
            return "Ongoing";
        case "Maintain":
            return "Achieved";
        default:
            return "N/A";
    }
};

const StatsDashboard = ({ user, plans }) => {
    const chartData = plans.slice(0, 7).reverse().map((plan, index) => ({
        name: `Day ${index + 1}`,
        Target: plan.plan_data.summary.actualCalories,
        Actual: plan.plan_data.summary.actualCalories,
    }));

    const timeline = estimateGoalTimeline(user?.user_metadata?.goal, user?.user_metadata?.weight);

    return (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-gradient-to-br from-rose-200 via-orange-100 to-pink-200 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 text-lg">7-Day Calorie Intake</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Line type="monotone" dataKey="Target" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} />
                        <Line type="monotone" dataKey="Actual" stroke="#84cc16" strokeWidth={3} dot={{ fill: '#84cc16', r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4 ">
                
                <StatCard title="Primary Goal" value={user?.user_metadata?.goal || 'N/A'} unit="" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                </StatCard>
                
                <StatCard title="Est. Time to Goal" value={timeline} unit="">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <circle cx="12" cy="12" r="10"/>
                         <path d="M12 6v6l4 2"/>
                     </svg>
                </StatCard>
                
            </div>
        </div>
    );
};


const Dashboard = () => {
    const [historicalPlans, setHistoricalPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showReGenerateModal, setShowReGenerateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const { user, isLoading: isAuthLoading, logout, refreshUserSession } = useAuth();
    const navigate = useNavigate();

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiClient.get('/plans/history');
            setHistoricalPlans(data);
        } catch (err) { setError('Could not fetch historical plans.'); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (!isAuthLoading && user) {
             if (user.user_metadata && !user.user_metadata.age) { navigate('/onboarding'); return; }
            fetchPlans();
        } else if (!isAuthLoading && !user) {
            navigate('/login');
        }
    }, [user, isAuthLoading, navigate, fetchPlans]);

    const handleGenerate = async (feedback = null) => {
        setIsLoading(true); setShowFeedbackModal(false); setError('');
        try {
            await apiClient.post('/plans/generate', { feedback, isRegeneration: false });
            await fetchPlans();
        } catch (err) { setError('Failed to generate a new plan.'); }
        finally { setIsLoading(false); }
    };

    const handleReGenerate = async () => {
        setShowReGenerateModal(false); setIsLoading(true); setError('');
        try {
            await apiClient.post('/plans/generate', { isRegeneration: true });
            await fetchPlans();
        } catch (err) { setError('Failed to re-generate plan.'); }
        finally { setIsLoading(false); }
    };
    
    const onGenerateClick = () => {
        const today = new Date(); today.setUTCHours(0,0,0,0);
        const lastPlanDate = historicalPlans.length > 0 ? new Date(historicalPlans[0].plan_date) : null;
        if(lastPlanDate) lastPlanDate.setUTCHours(0,0,0,0);

        const diffTime = lastPlanDate ? today - lastPlanDate : Infinity;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (historicalPlans.length === 0 || diffDays > 1) {
            handleGenerate();
        } else {
            setShowFeedbackModal(true);
        }
    };

    const handleMealToggle = async (planId, mealName, isCompleted) => {
        try {
            const { data: updatedPlan } = await apiClient.patch('/plans/complete-meal', { planId, mealName, isCompleted });
            setHistoricalPlans(prev => prev.map(p => (p.id === planId ? updatedPlan : p)));
            const allComplete = Object.values(updatedPlan.completed_meals).every(s => s === true);
            if (allComplete) { await refreshUserSession(); }
        } catch(err) { setError('Failed to update meal status.'); }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            await apiClient.delete('/users/me');
            await logout();
            navigate('/register');
        } catch (err) {
            setError('Failed to delete account.'); setIsLoading(false); setShowDeleteModal(false);
        }
    };

    if (isAuthLoading) return <Loader />;

    const userName = user?.email?.split('@')[0] || 'User';
    const streak = user?.user_metadata?.current_streak || 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const planExistsForToday = historicalPlans.some(p => p.plan_date === todayStr);

    return (
        <>
            {showFeedbackModal && ( 
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in-fast backdrop-blur-sm">
                    <div className="relative">
                        <FeedbackForm onSubmit={handleGenerate} isSubmitting={isLoading} />
                        <button onClick={() => setShowFeedbackModal(false)} className="absolute -top-3 -right-3 bg-white text-slate-600 hover:text-slate-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 text-2xl font-light hover:rotate-90 transform">
                            &times;
                        </button>
                    </div>
                </div> 
            )}
            {showReGenerateModal && ( <ConfirmationModal title="Re-generate Plan" message="Do you want to generate new food items with the same nutritional targets for today?" onConfirm={handleReGenerate} onCancel={() => setShowReGenerateModal(false)} isConfirming={isLoading} confirmText="Yes, Re-generate" /> )}
            {showDeleteModal && ( <ConfirmationModal title="Delete Account" message="This action is irreversible. All your data will be permanently deleted." onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteModal(false)} isConfirming={isLoading} confirmText="Yes, Delete" /> )}

      <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="flex flex-wrap justify-between items-center mb-10 gap-4">
                         <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-sky-600 bg-clip-text text-transparent capitalize">Hello, {userName}!</h1>
                         <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 py-2.5 px-4 bg-white rounded-full border-2 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                                 <StreakIcon/>
                                 <span className="font-bold text-slate-800 text-lg">{streak}</span>
                                 <span className="text-sm text-slate-600 font-medium">Day Streak</span>
                             </div>
                             <button onClick={logout} className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl shadow-md hover:shadow-lg hover:bg-slate-50 transition-all duration-200">
                                 <LogOutIcon/> Logout
                             </button>
                         </div>
                    </header>
                    <main>
                         <StatsDashboard user={user} plans={historicalPlans} />

                         <div className=" bg-gradient-to-br from-blue-500 via-indigo-300 to-fuchsia-300
 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8 text-center border border-sky-100">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready for your plan?</h2>
                            <p className="text-slate-900 mb-6">Click below to generate your personalized meal plan for the day.</p>
                            <button onClick={onGenerateClick} disabled={planExistsForToday || isLoading} className="w-full sm:w-auto mx-auto flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-sky-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100">
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Generate Today's Plan
                                    </>
                                )}
                            </button>
                            {planExistsForToday && <p className="text-sm text-slate-800 mt-4 font-medium">✓ You've already generated a plan for today. Come back tomorrow!</p>}
                            {error && <p className="text-red-600 text-sm mt-4 bg-red-50 py-2 px-4 rounded-lg inline-block border border-red-200">{error}</p>}
                         </div>

                         {planExistsForToday && (
                             <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md hover:shadow-lg transition-all duration-300">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">Not satisfied with today's meals?</h3>
                                    <p className="text-sm text-slate-600">Generate new food options with the same nutritional targets.</p>
                                </div>
                                <button onClick={() => setShowReGenerateModal(true)} disabled={isLoading} className="px-6 py-3 text-sm font-semibold text-amber-800 bg-white rounded-xl hover:bg-amber-100 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap">
                                    🔄 Re-generate
                                </button>
                             </div>
                         )}

                         <div className="space-y-5">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <div className="w-1 h-8 bg-gradient-to-b from-sky-400 to-sky-600 rounded-full"></div>
                                Your Plan History
                            </h2>
                            {historicalPlans.length > 0 ? (
                                historicalPlans.map((plan, index) => (
                                    <AccordionItem key={plan.id} day={historicalPlans.length - index} date={new Date(plan.plan_date).toLocaleDateString()} plan={plan} onMealToggle={handleMealToggle} />
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white rounded-xl shadow-md border border-slate-200">
                                    <div className="w-20 h-20  mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 text-lg">No plans generated yet. Click the button above to start!</p>
                                </div>
                            )}
                         </div>
                    </main>
                    <footer className="mt-12 pt-8 border-t-2 border-slate-200 text-center">
                        <button onClick={() => setShowDeleteModal(true)} className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium transition-colors duration-200">
                            Delete Account
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default Dashboard;