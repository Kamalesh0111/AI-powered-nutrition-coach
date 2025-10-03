import React, { useState } from 'react';

/**
 * A reusable, styled radio button component for the feedback options.
 */
const RatingOption = ({ name, value, checked, onChange, children }) => (
  <label
    className={`block text-center p-3 rounded-lg cursor-pointer border-2 transition-colors text-sm font-medium ${
      checked
        ? 'bg-indigo-100 border-indigo-500 text-indigo-800'
        : 'bg-gray-50 border-transparent hover:bg-gray-200 text-gray-700'
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="sr-only" // Hides the default radio button
    />
    {children}
  </label>
);

/**
 * A form for users to submit daily feedback. It's designed to be controlled
 * by a parent component which will handle the actual API submission.
 */
const FeedbackForm = ({ onSubmit, isSubmitting, error, successMessage }) => {
  const [feedback, setFeedback] = useState({
    satiety: 3,
    energy: 3,
    adherence: 3,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // The value from radio inputs is a string, so we parse it to a number
    setFeedback(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // The parent component's onSubmit function is called with the feedback data.
    onSubmit(feedback);
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Daily Check-in</h2>
        <p className="text-gray-600 mt-2">
          Let us know how you felt today so we can adapt your plan.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Satiety Question */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-3 text-center">
            How were your hunger levels today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            <RatingOption name="satiety" value={1} checked={feedback.satiety === 1} onChange={handleChange}>Starving</RatingOption>
            <RatingOption name="satiety" value={2} checked={feedback.satiety === 2} onChange={handleChange}>Hungry</RatingOption>
            <RatingOption name="satiety" value={3} checked={feedback.satiety === 3} onChange={handleChange}>Neutral</RatingOption>
            <RatingOption name="satiety" value={4} checked={feedback.satiety === 4} onChange={handleChange}>Satisfied</RatingOption>
            <RatingOption name="satiety" value={5} checked={feedback.satiety === 5} onChange={handleChange}>Stuffed</RatingOption>
          </div>
        </div>

        {/* Energy Question */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-3 text-center">
            How were your energy levels today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            <RatingOption name="energy" value={1} checked={feedback.energy === 1} onChange={handleChange}>Exhausted</RatingOption>
            <RatingOption name="energy" value={2} checked={feedback.energy === 2} onChange={handleChange}>Tired</RatingOption>
            <RatingOption name="energy" value={3} checked={feedback.energy === 3} onChange={handleChange}>Normal</RatingOption>
            <RatingOption name="energy" value={4} checked={feedback.energy === 4} onChange={handleChange}>Good</RatingOption>
            <RatingOption name="energy" value={5} checked={feedback.energy === 5} onChange={handleChange}>Amazing</RatingOption>
          </div>
        </div>

        {/* Adherence Question */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-3 text-center">
            How well did you stick to the plan?
          </label>
          <div className="grid grid-cols-5 gap-2">
            <RatingOption name="adherence" value={1} checked={feedback.adherence === 1} onChange={handleChange}>Not at all</RatingOption>
            <RatingOption name="adherence" value={2} checked={feedback.adherence === 2} onChange={handleChange}>Partially</RatingOption>
            <RatingOption name="adherence" value={3} checked={feedback.adherence === 3} onChange={handleChange}>Mostly</RatingOption>
            <RatingOption name="adherence" value={4} checked={feedback.adherence === 4} onChange={handleChange}>Well</RatingOption>
            <RatingOption name="adherence" value={5} checked={feedback.adherence === 5} onChange={handleChange}>Perfectly</RatingOption>
          </div>
        </div>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-center text-green-600">{successMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit My Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

