import React, { useState } from 'react';
import PropTypes from 'prop-types';

// --- Reusable Components ---
const ChevronLeftIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="m15 18-6-6 6-6" /></svg> );
const ChevronRightIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="m9 18 6-6-6-6" /></svg> );

const OptionCard = ({ name, value, selectedValue, onChange, children, description }) => (
    <label className={`relative block text-left p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${selectedValue === value ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-200' : 'bg-slate-100 border-transparent hover:bg-slate-200'}`}>
        <input type="radio" name={name} value={value} checked={selectedValue === value} onChange={onChange} className="sr-only" />
        <span className="font-semibold text-slate-800">{children}</span>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        {selectedValue === value && (
            <div className="absolute top-3 right-3 h-5 w-5 flex items-center justify-center bg-sky-600 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
            </div>
        )}
    </label>
);

const TOTAL_STEPS = 4;

const OnboardingForm = ({ onSubmit, isSubmitting }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        age: '',
        gender: 'Female',
        height: '',
        weight: '',
        activity_level: 'Lightly active',
        // --- THE FIX ---
        // The initial goal is now null, forcing the user to make a selection.
        goal: null,
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isNumeric = ['age', 'height', 'weight'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? (value === '' ? '' : Number(value)) : value }));
    };

    const nextStep = () => {
        if (step === 1 && (!formData.age || !formData.gender)) { setError('Please fill in all fields.'); return; }
        if (step === 2 && (!formData.height || !formData.weight)) { setError('Please fill in all fields.'); return; }
        if (step === 3 && !formData.activity_level) { setError('Please select an activity level.'); return; }
        setError('');
        setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    };

    const prevStep = () => { setStep(prev => Math.max(prev - 1, 1)); setError(''); };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        // This validation now works correctly because the initial state is null.
        if (!formData.goal) { setError('Please select a primary goal to continue.'); return; }
        setError('');
        onSubmit(formData);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6  animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800 text-center">About You</h3>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" placeholder="e.g., 28" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Gender</label>
                            <div className="grid grid-cols-3 gap-3">
                                <OptionCard name="gender" value="Female" selectedValue={formData.gender} onChange={handleChange}>Female</OptionCard>
                                <OptionCard name="gender" value="Male" selectedValue={formData.gender} onChange={handleChange}>Male</OptionCard>
                                <OptionCard name="gender" value="Other" selectedValue={formData.gender} onChange={handleChange}>Other</OptionCard>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800 text-center">Your Metrics</h3>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-slate-600 mb-1">Height (cm)</label>
                            <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" placeholder="e.g., 165" />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-slate-600 mb-1">Weight (kg)</label>
                            <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" placeholder="e.g., 60" />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-3 animate-fade-in">
                         <h3 className="text-xl font-bold text-slate-800 text-center mb-4">Your Lifestyle</h3>
                        <OptionCard name="activity_level" value="Sedentary" selectedValue={formData.activity_level} onChange={handleChange}>Sedentary</OptionCard>
                        <OptionCard name="activity_level" value="Lightly active" selectedValue={formData.activity_level} onChange={handleChange}>Lightly Active</OptionCard>
                        <OptionCard name="activity_level" value="Moderately active" selectedValue={formData.activity_level} onChange={handleChange}>Moderately Active</OptionCard>
                        <OptionCard name="activity_level" value="Very active" selectedValue={formData.activity_level} onChange={handleChange}>Very Active</OptionCard>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-3 animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800 text-center mb-4">What's Your Primary Goal?</h3>
                        <OptionCard name="goal" value="Weight Loss" selectedValue={formData.goal} onChange={handleChange} description="Focus on a caloric deficit with reduced fat and carbs.">Weight Loss</OptionCard>
                        <OptionCard name="goal" value="Muscle Gain" selectedValue={formData.goal} onChange={handleChange} description="High-protein diet in a caloric surplus to build lean mass.">Muscle Gain</OptionCard>
                        <OptionCard name="goal" value="Carbo-Cut Diet" selectedValue={formData.goal} onChange={handleChange} description="A ketogenic-style approach with very low carbs and sugar.">Carbo-Cut Diet</OptionCard>
                        <OptionCard name="goal" value="Fat Cut Diet" selectedValue={formData.goal} onChange={handleChange} description="Low-fat diet focused on lean protein and complex carbs.">Fat Cut Diet</OptionCard>
                    </div>
                );
            default: return null;
        }
    };

    const progress = (step / TOTAL_STEPS) * 100;

    return (
        <div className="bg-gradient-to-br from-rose-200 via-orange-100 to-pink-200 p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
            <div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-slate-900">Create Your Profile</h2><p className="text-slate-500 mt-2">This helps us create your personalized plan.</p></div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8"><div className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div></div>
            <form onSubmit={handleFormSubmit}>
                <div className="min-h-[300px]">{renderStepContent()}</div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="mt-10 flex justify-between items-center">
                    <button type="button" onClick={prevStep} disabled={step === 1} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeftIcon /> Back</button>
                    {step < TOTAL_STEPS ? (
                        <button type="button" onClick={nextStep} className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform hover:scale-105">Next <ChevronRightIcon /></button>
                    ) : (
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-wait transition-transform hover:scale-105">{isSubmitting ? 'Generating Plan...' : 'Create My Plan'}</button>
                    )}
                </div>
            </form>
        </div>
    );
};

OnboardingForm.propTypes = { onSubmit: PropTypes.func.isRequired, isSubmitting: PropTypes.bool };
export default OnboardingForm;

