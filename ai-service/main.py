from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from models import UserInput, PlanResponse
from planner import (
    calculate_bmi,
    calculate_bmr,
    calculate_tdee,
    calculate_macros,
    generate_workout_plan,
    generate_nutrition_plan,
)
from datetime import date, timedelta
import json

app = FastAPI(
    title="AI Fitness Trainer Service",
    description="Enhanced AI service using scientific data for personalized workout and nutrition plans",
    version="2.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/plan", response_model=PlanResponse)
async def generate_plan(user_input: UserInput):
    """
    Generate a personalized workout and nutrition plan based on user profile using scientific principles.
    """
    try:
        # Extract user data
        weight = user_input.weight
        height = user_input.height
        age = user_input.age
        sex = user_input.sex
        goal = user_input.goal
        activity_level = user_input.activity_level

        # Calculate health metrics
        bmi = calculate_bmi(weight, height)
        bmr = calculate_bmr(weight, height, age, sex)
        tdee = calculate_tdee(bmr, activity_level)
        macros = calculate_macros(tdee, goal)

        # Generate plans
        workout_plan = generate_workout_plan(user_input.dict())
        nutrition_plan = generate_nutrition_plan(user_input.dict(), tdee)

        # Return response
        return PlanResponse(
            workoutPlan=workout_plan,
            nutritionPlan=nutrition_plan,
            tdee=round(tdee, 1),
            bmr=round(bmr, 1),
            bmi=round(bmi, 1),
            macros=macros,
            generatedAt=date.today(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "AI Fitness Trainer", "version": "2.0.0"}


@app.post("/coach/weekly-analysis")
async def weekly_coach_analysis(user_data: dict):
    """
    Generate weekly analysis for coach-client connection.
    Provides insights on progress, adherence, and recommendations.
    """
    try:
        user_id = user_data.get("userId")
        current_weight = user_data.get("weight")
        goal = user_data.get("goal")
        weeks_trained = user_data.get("weeksTrained", 0)
        adherence_rate = user_data.get("adherenceRate", 0.8)  # Default 80% adherence
        
        # Calculate expected progress based on scientific principles
        if goal == "lose_weight":
            expected_loss_per_week = 0.5  # kg per week (safe, sustainable rate)
            expected_change = -expected_loss_per_week * weeks_trained
            progress_message = f"Expected weight loss: {expected_change:.1f} kg over {weeks_trained} weeks"
        elif goal == "gain_muscle":
            expected_gain_per_week = 0.25  # kg per week (lean muscle gain)
            expected_change = expected_gain_per_week * weeks_trained
            progress_message = f"Expected muscle gain: {expected_change:.1f} kg over {weeks_trained} weeks"
        else:  # maintain_weight
            expected_change = 0
            progress_message = f"Weight maintenance expected over {weeks_trained} weeks"
        
        # Generate recommendations based on adherence
        recommendations = []
        if adherence_rate < 0.7:
            recommendations.append("Focus on building consistent habits - start with 2-3 workouts per week")
            recommendations.append("Meal prep on weekends to improve nutrition adherence")
        elif adherence_rate < 0.9:
            recommendations.append("Good progress! Consider increasing workout intensity slightly")
            recommendations.append("Track macronutrients more precisely for better results")
        else:
            recommendations.append("Excellent adherence! Consider advanced progression techniques")
            recommendations.append("Evaluate readiness for program advancement")
        
        # Add goal-specific recommendations
        if goal == "lose_weight":
            recommendations.append("Ensure adequate protein intake to preserve muscle mass during deficit")
            recommendations.append("Include strength training 2-3x weekly to maintain metabolic rate")
        elif goal == "gain_muscle":
            recommendations.append("Consume protein within 30 minutes post-workout for optimal synthesis")
            recommendations.append("Ensure caloric surplus comes primarily from quality carbohydrates and proteins")
        
        return {
            "userId": user_id,
            "analysisDate": date.today().isoformat(),
            "weeksTrained": weeks_trained,
            "adherenceRate": adherence_rate,
            "expectedProgress": expected_change,
            "progressMessage": progress_message,
            "recommendations": recommendations,
            "coachNotes": f"Client showing {adherence_rate*100:.0f}% adherence. Progress tracking indicates {'positive' if expected_change != 0 else 'stable'} trajectory toward {goal.replace('_', ' ')} goal.",
            "nextSteps": [
                "Continue current program for another 2-4 weeks",
                "Schedule form check for compound movements",
                "Consider body measurements in addition to weight tracking"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating weekly analysis: {str(e)}")


@app.post("/coach/progress-adjustment")
async def progress_based_adjustment(user_data: dict):
    """
    Generate workout/nutrition adjustments based on client progress.
    """
    try:
        user_id = user_data.get("userId")
        current_weight = user_data.get("weight")
        goal = user_data.get("goal")
        weeks_trained = user_data.get("weeksTrained", 0)
        weight_change = user_data.get("weightChange", 0)  # Actual weight change
        
        adjustments = {
            "workoutAdjustments": [],
            "nutritionAdjustments": [],
            "rationale": ""
        }
        
        # Calculate expected vs actual progress
        if goal == "lose_weight":
            expected_loss_per_week = 0.5
            expected_loss = expected_loss_per_week * weeks_trained
            variance = weight_change - (-expected_loss)  # weight_change is negative for loss
            
            if variance > 1:  # Losing more than expected
                adjustments["nutritionAdjustments"].append("Consider slight calorie increase to prevent excessive deficit")
                adjustments["workoutAdjustments"].append("Maintain current strength training to preserve muscle")
                adjustments["rationale"] = "Weight loss exceeding targets - adjusting to preserve lean mass"
            elif variance < -1:  # Losing less than expected
                adjustments["nutritionAdjustments"].append("Review portion sizes and tracking accuracy")
                adjustments["workoutAdjustments"].append("Consider adding 1-2 cardio sessions or increasing intensity")
                adjustments["rationale"] = "Weight loss below targets - increasing energy expenditure"
            else:
                adjustments["rationale"] = "Progress on track - maintain current approach"
                
        elif goal == "gain_muscle":
            expected_gain_per_week = 0.25
            expected_gain = expected_gain_per_week * weeks_trained
            variance = weight_change - expected_gain
            
            if variance > 1:  # Gaining more than expected
                adjustments["nutritionAdjustments"].append("Consider slight calorie decrease to minimize fat gain")
                adjustments["workoutAdjustments"].append("Maintain current hypertrophy focus")
                adjustments["rationale"] = "Weight gain exceeding lean targets - adjusting to minimize fat accumulation"
            elif variance < -1:  # Gaining less than expected
                adjustments["nutritionAdjustments"].append("Increase caloric intake by 10-15%")
                adjustments["workoutAdjustments"].append("Ensure progressive overload in strength training")
                adjustments["rationale"] = "Muscle gain below targets - increasing caloric and mechanical tension"
            else:
                adjustments["rationale"] = "Progress on track - maintain current approach"
        
        return {
            "userId": user_id,
            "analysisDate": date.today().isoformat(),
            "adjustments": adjustments,
            "expectedVsActual": {
                "expectedChange": expected_loss if goal == "lose_weight" else expected_gain if goal == "gain_muscle" else 0,
                "actualChange": weight_change,
                "variance": variance
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating progress adjustment: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
