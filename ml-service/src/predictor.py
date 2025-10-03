import joblib
import pandas as pd
from pathlib import Path
from .schemas import UserProfile, NutritionalTargets
from .utils import preprocess

# --- Model Loading ---
# This locates and loads your pre-trained machine learning model file.
MODEL_PATH = Path(__file__).parent.parent / "models/nutrition_model.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    model = None
    print(f"Error: Model file not found at {MODEL_PATH}. Please run the training script.")
except Exception as e:
    model = None
    print(f"An error occurred while loading the model: {e}")


def predict_macros(profile: UserProfile) -> NutritionalTargets:
    """
    Takes a user's profile, preprocesses it, and uses the loaded ML model
    to predict their daily nutritional targets.
    """
    if model is None:
        raise RuntimeError("Machine Learning model is not loaded. Cannot make predictions.")

    # 1. Preprocess the input data into the correct format
    processed_df = preprocess(profile)

    # 2. Use the model to predict the targets
    # The model outputs an array of arrays, e.g., [[calories, protein, carbs, fat]]
    prediction = model.predict(processed_df)

    # 3. Extract the results and format them into the response model
    targets = prediction[0]
    result = NutritionalTargets(
        calories=targets[0],
        protein=targets[1],
        carbs=targets[2],
        fat=targets[3]
    )
    
    return result

