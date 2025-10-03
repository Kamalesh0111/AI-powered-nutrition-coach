import React from 'react';
import PropTypes from 'prop-types';

const FlameIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-500 mb-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg> );
const DrumstickIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-500 mb-1"><path d="M12.65 7.65 14 5l5 5-2.65 1.35a2.5 2.5 0 1 1-3.7-3.7Z" /><path d="m14 5-2.5 2.5" /><path d="M18 13c-2.2 0-4 1.8-4 4s1.8 4 4 4a4 4 0 0 0 4-4" /><path d="M14.5 11.5 16 13" /></svg> );
const ZapIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-500 mb-1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> );
const TargetIcon = () => ( <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 mb-1"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> );

const StatCard = ({ icon, label, value, unit }) => (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 rounded-lg p-4 text-center">
        {icon}
        <span className="text-xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-500 uppercase font-medium">{label} ({unit})</span>
    </div>
);

const MealPlanCard = ({ plan, completedMeals, onMealToggle }) => {
    if (!plan || !plan.summary || !plan.meals) {
        return <div className="text-center text-gray-500">Loading plan...</div>;
    }

    return (
        <div className="bg-gradient-to-br from-rose-200 via-orange-200 to-pink-100 p-6 rounded-xl w-full max-w-2xl mx-auto">
            {plan.reason && <p className="text-sm text-indigo-600 mb-4">{plan.reason}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<FlameIcon />} label="Calories" value={plan.summary.actualCalories ?? 0} unit="kcal" />
                <StatCard icon={<DrumstickIcon />} label="Protein" value={plan.summary.actualProtein ?? 0} unit="g" />
                <StatCard icon={<ZapIcon />} label="Carbs" value={plan.summary.actualCarbs ?? 0} unit="g" />
                <StatCard icon={<TargetIcon />} label="Fat" value={plan.summary.actualFat ?? 0} unit="g" />
            </div>
            <div className="space-y-4">
                {plan.meals.map((meal) => {
                    // Normalize meal name for key access, e.g., "Breakfast" -> "breakfast"
                    const mealKey = meal.name.toLowerCase();
                    return (
                        <div key={mealKey} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${mealKey}-checkbox`}
                                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    checked={completedMeals[mealKey] || false}
                                    onChange={(e) => onMealToggle(mealKey, e.target.checked)}
                                />
                                <label htmlFor={`${mealKey}-checkbox`} className="ml-3 text-lg font-semibold text-gray-700">{meal.name}</label>
                            </div>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2 pl-8">
                                {meal.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <span className="font-medium">{item.food}</span>: {item.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

MealPlanCard.propTypes = {
  plan: PropTypes.object,
  completedMeals: PropTypes.object,
  onMealToggle: PropTypes.func,
};

export default MealPlanCard;

