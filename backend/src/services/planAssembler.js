import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

// --- Smart Categorization & Portion Sizing ---
const MAIN_COURSE_KEYWORDS = ['chicken', 'paneer', 'dal', 'egg', 'fish', 'beef', 'curry', 'kofta', 'chickpeas'];
const SIDE_DISH_KEYWORDS = ['vegetable', 'salad', 'roti', 'chapatti', 'naan', 'rice'];
const BREAKFAST_KEYWORDS = ['oats', 'poha', 'paratha', 'idli', 'dosa', 'upma', 'sandwich', 'egg'];
const LOW_CARB_SIDES = ['vegetable', 'salad', 'paneer'];
const PORTION_SIZES = { main: 150, side: 100, breakfast: 200 };

/**
 * Fetches a suitable food item, with goal-specific filters.
 */
const fetchMealComponent = async (keywords, goal, exclude = []) => {
    try {
        const keywordQuery = keywords.map(k => `food_name.ilike.%${k}%`).join(',');
        let query = supabase
            .from('food_nutrition_data')
            .select('food_name, caloric_value, protein, carbohydrates, fats, free_sugar, fibre')
            .not('caloric_value', 'is', null).gt('caloric_value', 0)
            .not('food_name', 'is', null)
            .or(keywordQuery);

        if (exclude.length > 0) {
            query = query.not('food_name', 'in', `(${exclude.map(e => `'${e}'`).join(',')})`);
        }

        if (goal === 'Carbo-Cut Diet') {
            query = query.order('carbohydrates', { ascending: true, nulls: 'last' });
        } else if (goal === 'Fat Cut Diet') {
            query = query.order('fats', { ascending: true, nulls: 'last' });
        } else if (goal === 'Weight Loss') {
            query = query.order('protein', { ascending: false, nulls: 'last' });
        } else { // Muscle Gain or Bodybuilding
            query = query.order('protein', { ascending: false, nulls: 'last' });
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;
        if (data && data.length > 0) {
            return data[Math.floor(Math.random() * data.length)];
        }
        return null;
    } catch (err) {
        logger.error('Error fetching meal component:', err);
        return null;
    }
};

/**
 * Constructs a complete, multi-component meal using an iterative approach to meet calorie targets.
 */
const constructMeal = async (mealName, targetCalories, goal) => {
    let mealItems = [], totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    
    const MAX_COMPONENTS = 3; // Limit to a max of 3 items per meal
    let componentsToFetch = [];

    if (mealName === 'breakfast') {
        componentsToFetch.push({ type: 'breakfast', keywords: BREAKFAST_KEYWORDS });
    } else {
        componentsToFetch.push({ type: 'main', keywords: MAIN_COURSE_KEYWORDS });
        // Start with a side dish
        componentsToFetch.push({ type: 'side', keywords: (goal === 'Carbo-Cut Diet' ? LOW_CARB_SIDES : SIDE_DISH_KEYWORDS) });
    }

    for (const component of componentsToFetch) {
        // Stop adding items if we're close to the target
        if (totalCalories > targetCalories * 0.85) break;
        if (mealItems.length >= MAX_COMPONENTS) break;

        const exclude = mealItems.map(i => i.food);
        const fetched = await fetchMealComponent(component.keywords, goal, exclude);

        if (fetched) {
            const servingSizeGrams = PORTION_SIZES[component.type];
            const scale = servingSizeGrams / 100;

            mealItems.push({ food: fetched.food_name, quantity: `~${Math.round(servingSizeGrams)}g` });
            totalCalories += (fetched.caloric_value ?? 0) * scale;
            totalProtein += (fetched.protein ?? 0) * scale;
            totalCarbs += (fetched.carbohydrates ?? 0) * scale;
            totalFats += (fetched.fats ?? 0) * scale;
        }
    }
    
    if (mealItems.length === 0) {
        return { name: `No suitable ${mealName} found.`, items: [], fallback: true };
    }

    return { name: mealName.charAt(0).toUpperCase() + mealName.slice(1), items: mealItems, calories: Math.round(totalCalories), protein: Math.round(totalProtein), carbs: Math.round(totalCarbs), fat: Math.round(totalFats) };
};

export const assemblePlan = async (targets, goal) => {
    logger.info('Assembling a new multi-component meal plan...');
    logger.debug('Daily targets:', targets);
    logger.debug('User preferences:', goal);

    const mealTargets = {
        breakfast: targets.calories * 0.30,
        lunch:     targets.calories * 0.40,
        dinner:    targets.calories * 0.30,
    };

    const [breakfast, lunch, dinner] = await Promise.all([
        constructMeal('breakfast', mealTargets.breakfast, goal),
        constructMeal('lunch', mealTargets.lunch, goal),
        constructMeal('dinner', mealTargets.dinner, goal),
    ]);

    const allMeals = [breakfast, lunch, dinner];
    const summary = allMeals.reduce((acc, meal) => {
        if (!meal.fallback) {
            acc.actualCalories += meal.calories;
            acc.actualProtein += meal.protein;
            acc.actualCarbs += meal.carbs;
            acc.actualFat += meal.fat;
        }
        return acc;
    }, { actualCalories: 0, actualProtein: 0, actualCarbs: 0, actualFat: 0 });

    const finalPlan = { meals: allMeals, summary: summary };
    logger.info('Successfully assembled meal plan.');
    logger.info('--- Generated Meal Plan ---', finalPlan);
    return finalPlan;
};

