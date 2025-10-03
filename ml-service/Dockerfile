# Stage 1: Use an official Python runtime as a parent image
FROM python:3.9-slim

# Stage 2: Set the working directory in the container
WORKDIR /app

# Stage 3: Set the PYTHONPATH environment variable
ENV PYTHONPATH=/app

# Stage 4: Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 5: Copy the rest of the application's code into the container
COPY . .

# Stage 6: Expose the port the app runs on
EXPOSE 8001

# Stage 7: Define the command to run the application
# --- THE FINAL FIX ---
# This command now correctly points to the `app.py` file (the "app" module)
# and the FastAPI instance named "app" inside it. This resolves the startup error.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]

