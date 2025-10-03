from pydantic import BaseModel, Field
from enum import Enum

# --- THE SYNCHRONIZATION KEY ---
# This Enum MUST contain all the goal values from the frontend and training script.
class Goal(str, Enum):
    weight_loss = "Weight Loss"
    muscle_gain = "Muscle Gain"
    carbo_cut = "Carbo-Cut Diet"
    fat_cut = "Fat Cut Diet"

class Gender(str, Enum):
    male = "Male"
    female = "Female"
    other = "Other"

class ActivityLevel(str, Enum):
    sedentary = "Sedentary"
    lightly_active = "Lightly active"
    moderately_active = "Moderately active"
    very_active = "Very active"

class UserProfile(BaseModel):
    age: int = Field(..., gt=0)
    gender: Gender
    height: float = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    activity_level: ActivityLevel
    goal: Goal

class NutritionalTargets(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float

