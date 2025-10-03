import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# --- Configuration ---
NUM_SAMPLES = 10000
MODEL_OUTPUT_DIR = "ml-service/models"
MODEL_OUTPUT_PATH = os.path.join(MODEL_OUTPUT_DIR, "nutrition_model.pkl")

EXPECTED_COLUMNS_ORDER = [
    'age', 'height', 'weight',
    'gender_Female', 'gender_Male', 'gender_Other',
    'activity_level_Sedentary', 'activity_level_Lightly active',
    'activity_level_Moderately active', 'activity_level_Very active',
    'goal_Weight Loss', 'goal_Muscle Gain', 'goal_Carbo-Cut Diet', 'goal_Fat Cut Diet'
]

def generate_synthetic_data(num_samples: int) -> pd.DataFrame:
    """Generates a DataFrame of synthetic user profiles and their nutritional targets."""
    print(f"Generating {num_samples} intelligent synthetic profiles...")
    
    data = {
        'age': np.random.randint(18, 70, size=num_samples),
        'height': np.random.uniform(150, 200, size=num_samples),
        'weight': np.random.uniform(50, 120, size=num_samples),
        'gender': np.random.choice(['Male', 'Female', 'Other'], size=num_samples, p=[0.48, 0.48, 0.04]),
        'activity_level': np.random.choice(['Sedentary', 'Lightly active', 'Moderately active', 'Very active'], size=num_samples),
        'goal': np.random.choice(['Weight Loss', 'Muscle Gain', 'Carbo-Cut Diet', 'Fat Cut Diet'], size=num_samples)
    }
    df = pd.DataFrame(data)

    # --- RE-ENGINEERED GOAL-BASED MACRO LOGIC ---
    
    # BMR calculation with a fix for 'Other' gender (uses an average formula)
    bmr_male = 88.362 + (13.397 * df['weight']) + (4.799 * df['height']) - (5.677 * df['age'])
    bmr_female = 447.593 + (9.247 * df['weight']) + (3.098 * df['height']) - (4.330 * df['age'])
    bmr = np.select(
        [df['gender'] == 'Male', df['gender'] == 'Female'],
        [bmr_male, bmr_female],
        default=(bmr_male + bmr_female) / 2 # Average for 'Other'
    )

    activity_multipliers = {'Sedentary': 1.2, 'Lightly active': 1.375, 'Moderately active': 1.55, 'Very active': 1.725}
    tdee = bmr * df['activity_level'].map(activity_multipliers)

    calories, protein, carbs, fat = np.zeros(num_samples), np.zeros(num_samples), np.zeros(num_samples), np.zeros(num_samples)

    for i, row in df.iterrows():
        goal, current_tdee, current_bmr = row['goal'], tdee[i], bmr[i]
        
        # 1. Set Calorie Targets
        if goal == 'Weight Loss': final_calories = current_tdee - 400
        elif goal == 'Muscle Gain': final_calories = current_tdee + 300
        elif goal == 'Carbo-Cut Diet': final_calories = current_tdee - 200
        elif goal == 'Fat Cut Diet': final_calories = current_tdee - 300
        else: final_calories = current_tdee
        
        # Enforce minimum calorie safety net
        final_calories = max(final_calories, current_bmr * 1.1, 1200)
        calories[i] = final_calories

        # 2. Set Macronutrient Ratios as Percentages of Total Calories
        # This is a much safer and more balanced approach.
        if goal == 'Weight Loss': # Higher protein, balanced carbs/fat
            protein_pct, carbs_pct, fat_pct = 0.40, 0.35, 0.25
        elif goal == 'Muscle Gain': # Very high protein
            protein_pct, carbs_pct, fat_pct = 0.45, 0.30, 0.25
        elif goal == 'Carbo-Cut Diet': # Ketogenic style: very low carb, high fat
            protein_pct, carbs_pct, fat_pct = 0.30, 0.10, 0.60
        elif goal == 'Fat Cut Diet': # Low fat, high carb, moderate protein
            protein_pct, carbs_pct, fat_pct = 0.35, 0.50, 0.15
        else: # Default balanced ratio
            protein_pct, carbs_pct, fat_pct = 0.30, 0.40, 0.30
        
        # Convert percentages to grams
        protein[i] = (final_calories * protein_pct) / 4
        carbs[i] = (final_calories * carbs_pct) / 4
        fat[i] = (final_calories * fat_pct) / 9
    
    df['calories'], df['protein'], df['carbs'], df['fat'] = calories, protein, carbs, fat
    print("Synthetic data generation complete.")
    return df

def main():
    df = generate_synthetic_data(NUM_SAMPLES)
    y = df[['calories', 'protein', 'carbs', 'fat']]
    X = pd.get_dummies(df.drop(columns=['calories', 'protein', 'carbs', 'fat']))
    
    for col in EXPECTED_COLUMNS_ORDER:
        if col not in X.columns: X[col] = 0
    X = X[EXPECTED_COLUMNS_ORDER]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    print(f"Model training complete. MSE: {mean_squared_error(y_test, model.predict(X_test)):.2f}")
    if not os.path.exists(MODEL_OUTPUT_DIR): os.makedirs(MODEL_OUTPUT_DIR)
    joblib.dump(model, MODEL_OUTPUT_PATH)
    print(f"✅ Model successfully saved to: {MODEL_OUTPUT_PATH}")

if __name__ == "__main__":
    main()

