import { supabase, supabaseAdmin } from '../config/supabase.js';
import { assemblePlan } from '../services/planAssembler.js';
import { calculateAdjustments } from '../services/adaptationEngine.js';
import logger from '../utils/logger.js';

// Helper to get the current user from a token
const getUserByToken = async (req) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new Error('Authentication required.');
    }
    const token = authorization.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        throw new Error('Authentication failed.');
    }
    return user;
};

export const generateTodaysPlan = async (req, res) => {
    try {
        const authUser = await getUserByToken(req);
        const { feedback, planDate, isRegeneration } = req.body;
        const dateForPlan = planDate ? new Date(planDate) : new Date();

        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(authUser.id);
        const userProfile = user.user_metadata;
        if (!userProfile || !userProfile.age) return res.status(404).json({ message: 'User profile is incomplete.' });

        let adjustments = { calorie_adjustment: 0, protein_adjustment: 0 };
        if (isRegeneration) {
            adjustments.reason = "Your plan has been re-generated with new meal options.";
        } else {
            adjustments = calculateAdjustments(feedback ? [feedback] : []);
        }

        const baseTargets = {
            calories: userProfile.calories,
            protein: userProfile.protein,
            carbs: userProfile.carbs,
            fat: userProfile.fat,
        };

        const finalTargets = {
            calories: (baseTargets.calories || 2000) + adjustments.calorie_adjustment,
            protein: (baseTargets.protein || 120) + adjustments.protein_adjustment,
        };
        
        // --- THE FINAL SAFETY NET FIX ---
        // We enforce the hard minimum of 1200 calories AFTER receiving the AI's prediction
        // and applying any adjustments. This guarantees the rule is never broken.
        if (finalTargets.calories < 1200) {
            logger.warn(`Calorie target ${finalTargets.calories} was below minimum. Adjusting to 1200.`);
            finalTargets.calories = 1200;
        }

        const plan = await assemblePlan(finalTargets, userProfile.goal);
        const finalPlan = { ...plan, reason: adjustments.reason };
        const finalDateStr = dateForPlan.toISOString().split('T')[0];

        const { data: savedPlan, error: saveError } = await supabase
            .from('daily_plans')
            .upsert({ user_id: authUser.id, plan_date: finalDateStr, plan_data: finalPlan }, { onConflict: 'user_id, plan_date' })
            .select().single();
        if (saveError) throw saveError;

        res.status(201).json({ message: 'Plan generated successfully', plan: savedPlan });
    } catch (error) {
        logger.error('Error generating plan:', error.message);
        res.status(500).json({ message: 'Internal server error while generating plan.' });
    }
};

// ... (getHistoricalPlans and updateMealCompletion remain the same) ...
export const getHistoricalPlans = async (req, res) => {
    try {
        const authUser = await getUserByToken(req);
        const { data: plans, error } = await supabase.from('daily_plans').select('*').eq('user_id', authUser.id).order('plan_date', { ascending: false });
        if (error) throw error;
        res.status(200).json(plans);
    } catch (error) {
        logger.error('Error fetching historical plans:', error.message);
        res.status(500).json({ message: 'Failed to fetch historical plans.' });
    }
};

export const updateMealCompletion = async (req, res) => {
    try {
        const authUser = await getUserByToken(req);
        const { planId, mealName, isCompleted } = req.body;
        const { data: plan, error: fetchError } = await supabase.from('daily_plans').select('completed_meals').eq('id', planId).eq('user_id', authUser.id).single();
        if (fetchError) throw fetchError;
        const allCompleteBefore = Object.values(plan.completed_meals).every(status => status === true);
        const updatedMeals = { ...plan.completed_meals, [mealName]: isCompleted };
        const allCompleteAfter = Object.values(updatedMeals).every(status => status === true);
        if (allCompleteAfter && !allCompleteBefore) {
            const { error: streakError } = await supabase.rpc('update_streak', { p_user_id: authUser.id, p_action: 'increment' });
            if (streakError) throw streakError;
            logger.info(`Streak incremented for user ${authUser.id}`);
        } else if (!allCompleteAfter && allCompleteBefore) {
            const { error: streakError } = await supabase.rpc('update_streak', { p_user_id: authUser.id, p_action: 'decrement' });
            if (streakError) throw streakError;
            logger.info(`Streak decremented for user ${authUser.id}`);
        }
        const { data: updatedPlan, error: updateError } = await supabase.from('daily_plans').update({ completed_meals: updatedMeals }).eq('id', planId).select().single();
        if (updateError) throw updateError;
        res.status(200).json(updatedPlan);
    } catch (error) {
        logger.error('Error updating meal completion:', error.message);
        res.status(500).json({ message: 'Failed to update meal status.' });
    }
};

