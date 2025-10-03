import pandas as pd
from .schemas import UserProfile

# --- THE SYNCHRONIZATION KEY ---
# This list MUST be an exact, character-for-character copy of the list
# from the `train_model.py` script.
EXPECTED_COLUMNS_ORDER = [
    'age', 'height', 'weight',
    'gender_Female', 'gender_Male', 'gender_Other',
    'activity_level_Sedentary', 'activity_level_Lightly active',
    'activity_level_Moderately active', 'activity_level_Very active',
    'goal_Weight Loss', 'goal_Muscle Gain', 'goal_Carbo-Cut Diet', 'goal_Fat Cut Diet'
]

def preprocess(profile: UserProfile) -> pd.DataFrame:
    """
    Converts a UserProfile Pydantic model into a one-hot encoded DataFrame
    that matches the format the machine learning model was trained on.
    """
    data = profile.dict()
    df = pd.DataFrame([data])

    # One-hot encode the categorical features
    X_processed = pd.get_dummies(df)
    
    # Add any missing columns that the model expects and fill them with 0.
    for col in EXPECTED_COLUMNS_ORDER:
        if col not in X_processed.columns:
            X_processed[col] = 0
            
    # Ensure the final DataFrame has the exact same column order as the training data.
    return X_processed[EXPECTED_COLUMNS_ORDER]

