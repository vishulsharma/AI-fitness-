# AI Fitness Trainer Service

A Python/FastAPI microservice for generating personalized workout and nutrition plans based on user profiles.

## Features

- Calculates BMI, BMR, and TDEE using scientifically validated formulas
- Generates personalized macronutrient recommendations based on fitness goals
- Creates 7-day workout plans with exercise selection based on goals and experience levels
- Produces daily nutrition plans with meal breakdowns and macro targets
- Rule-based logic (with potential for ML integration in future versions)

## Endpoints

### POST /plan
Generate a personalized fitness plan

**Request Body:**
```json
{
  "weight": 70.0,
  "height": 175.0,
  "age": 25,
  "sex": "male",
  "goal": "lose_weight",
  "activity_level": "moderately_active",
  "health_issues": []
}
```

**Response:**
```json
{
  "workoutPlan": [
    {
      "day": 1,
      "exercises": [
        {
          "exerciseId": 1,
          "name": "Push-up",
          "sets": 3,
          "reps": "10-15",
          "rest": 90
        }
      ]
    }
  ],
  "nutritionPlan": {
    "meals": [...],
    "dailyTotals": {
      "kcal": 2000,
      "protein": 150,
      "carbs": 200,
      "fat": 50
    }
  },
  "tdee": 2500.0,
  "bmr": 1600.0,
  "bmi": 22.9,
  "macros": {
    "protein": 150.0,
    "carbs": 200.0,
    "fat": 55.6
  },
  "generatedAt": "2026-09-28"
}
```

### GET /health
Health check endpoint

## Installation

```bash
pip install -r requirements.txt
```

## Running the Service

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

Or using Docker:

```bash
docker build -f Dockerfile.ai -t ai-fitness-service .
docker run -p 8001:8001 ai-fitness-service
```

## Development

This service is designed to be called by the main Node.js backend at `/api/plan/generate` endpoint.

The planner uses rule-based logic derived from:
- Mifflin-St Jeor Equation for BMR calculation
- Standard activity multipliers for TDEE
- Evidence-based macronutrient distributions for different fitness goals
- ACSM guidelines for exercise selection and programming