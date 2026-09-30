from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date

# User input model
class UserInput(BaseModel):
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in cm")
    age: int = Field(..., ge=13, le=120, description="Age in years")
    sex: Literal["male", "female"] = Field(..., description="Biological sex")
    goal: Literal["lose_weight", "maintain_weight", "gain_muscle"] = Field(..., description="Fitness goal")
    activity_level: Literal["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"] = Field(..., description="Activity level")
    health_issues: Optional[List[str]] = Field(default=None, description="List of health issues")

# Exercise model
class Exercise(BaseModel):
    id: int
    name: str
    muscle: List[str]
    equipment: List[str]
    difficulty: Literal["beginner", "intermediate", "advanced"]

# Workout plan model
class WorkoutPlan(BaseModel):
    day: int = Field(..., ge=1, le=7, description="Day of week (1=Monday, 7=Sunday)")
    exercises: List[dict]  # exerciseId, name, sets, reps, rest

# Nutrition plan model
class FoodItem(BaseModel):
    name: str
    grams: float
    kcal: float
    protein: float
    carbs: float
    fat: float

class Meal(BaseModel):
    meal: str  # Breakfast, Lunch, Dinner, Snack
    foods: List[FoodItem]
    total: dict  # kcal, protein, carbs, fat

class NutritionPlan(BaseModel):
    meals: List[Meal]
    dailyTotals: dict  # kcal, protein, carbs, fat

# Plan response model
class PlanResponse(BaseModel):
    workoutPlan: List[WorkoutPlan]
    nutritionPlan: NutritionPlan
    tdee: float
    bmr: float
    bmi: float
    macros: dict  # protein, carbs, fat in grams
    generatedAt: date