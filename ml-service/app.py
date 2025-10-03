from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Correct the import path to be relative from the root
from src.schemas import UserProfile, NutritionalTargets
from src.predictor import predict_macros

app = FastAPI(
    title="AI Nutrition Coach - ML Service",
    description="Predicts nutritional targets based on user profiles.",
    version="1.0.0"
)

# CORS Middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict", response_model=NutritionalTargets)
def predict(profile: UserProfile):
    """
    Receives user profile data, predicts nutritional targets,
    and returns them.
    """
    try:
        targets = predict_macros(profile)
        return targets
    except RuntimeError as e:
        # This handles the case where the model failed to load
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # A general error handler for any other issues
        raise HTTPException(status_code=400, detail=f"An error occurred during prediction: {e}")

@app.get("/health")
def health_check():
    """A simple health check endpoint."""
    return {"status": "ok"}

