from typing import List, Dict, Any
import random
import json
import math

# Enhanced exercise database with scientific metadata
EXERCISES: List[Dict[str, Any]] = [
    {"id": 1, "name": "Push-up", "muscle": ["chest", "shoulders", "triceps"], "equipment": ["bodyweight"], "difficulty": "beginner", "compound": True, "primary_movers": ["pectoralis major", "anterior deltoids", "triceps brachii"]},
    {"id": 2, "name": "Squat", "muscle": ["quads", "glutes", "hamstrings"], "equipment": ["bodyweight"], "difficulty": "beginner", "compound": True, "primary_movers": ["quadriceps", "gluteus maximus", "hamstrings"]},
    {"id": 3, "name": "Pull-up", "muscle": ["back", "biceps"], "equipment": ["pullup bar"], "difficulty": "intermediate", "compound": True, "primary_movers": ["latissimus dorsi", "biceps brachii"]},
    {"id": 4, "name": "Deadlift", "muscle": ["hamstrings", "glutes", "lower back"], "equipment": ["barbell"], "difficulty": "advanced", "compound": True, "primary_movers": ["hamstrings", "gluteus maximus", "erector spinae"]},
    {"id": 5, "name": "Bench Press", "muscle": ["chest", "shoulders", "triceps"], "equipment": ["barbell", "bench"], "difficulty": "beginner", "compound": True, "primary_movers": ["pectoralis major", "anterior deltoids", "triceps brachii"]},
    {"id": 6, "name": "Overhead Press", "muscle": ["shoulders", "triceps"], "equipment": ["barbell"], "difficulty": "beginner", "compound": True, "primary_movers": ["deltoids", "triceps brachii"]},
    {"id": 7, "name": "Barbell Row", "muscle": ["back", "biceps"], "equipment": ["barbell"], "difficulty": "beginner", "compound": True, "primary_movers": ["latissimus dorsi", "rhomboids", "biceps brachii"]},
    {"id": 8, "name": "Lunge", "muscle": ["quads", "glutes"], "equipment": ["bodyweight"], "difficulty": "beginner", "compound": True, "primary_movers": ["quadriceps", "gluteus maximus"]},
    {"id": 9, "name": "Plank", "muscle": ["core"], "equipment": ["bodyweight"], "difficulty": "beginner", "compound": False, "primary_movers": ["rectus abdominis", "transverse abdominis"]},
    {"id": 10, "name": "Burpee", "muscle": ["full body"], "equipment": ["bodyweight"], "difficulty": "intermediate", "compound": True, "primary_movers": ["full body"]},
]

# Evidence-based workout focus mappings
WORKOUT_FOCUS: Dict[str, Dict[str, Any]] = {
    "lose_weight": {
        "primary_focus": ["full body", "cardio", "metabolic conditioning"],
        "secondary_focus": ["strength", "endurance"],
        "rep_range": [12, 20],
        "rest_range": [30, 60],
        "intensity": "moderate",
        "weekly_frequency": [1, 2, 3, 4, 5, 6, 7]
    },
    "maintain_weight": {
        "primary_focus": ["strength", "cardio", "flexibility"],
        "secondary_focus": ["balance", "core"],
        "rep_range": [8, 15],
        "rest_range": [60, 90],
        "intensity": "moderate",
        "weekly_frequency": [1, 2, 3, 4, 5]
    },
    "gain_muscle": {
        "primary_focus": ["strength", "hypertrophy", "progressive overload"],
        "secondary_focus": ["power", "muscle endurance"],
        "rep_range": [6, 12],
        "rest_range": [90, 180],
        "intensity": "high",
        "weekly_frequency": [1, 2, 3, 5, 6]
    }
}

# Evidence-based nutrition focus mappings
NUTRITION_FOCUS: Dict[str, Dict[str, Any]] = {
    "lose_weight": {
        "calorie_adjustment": -0.2,  # 20% deficit
        "protein_ratio": 0.35,       # Higher protein for satiety and muscle preservation
        "carbs_ratio": 0.35,
        "fat_ratio": 0.3,
        "meal_timing": "distributed"
    },
    "maintain_weight": {
        "calorie_adjustment": 0.0,   # Maintenance
        "protein_ratio": 0.25,
        "carbs_ratio": 0.45,
        "fat_ratio": 0.3,
        "meal_timing": "standard"
    },
    "gain_muscle": {
        "calorie_adjustment": 0.15,  # 15% surplus for lean gains
        "protein_ratio": 0.3,        # Evidence-based for muscle synthesis
        "carbs_ratio": 0.4,
        "fat_ratio": 0.3,
        "meal_timing": "peri-workout"
    }
}

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate BMI using standard formula."""
    height_m = height_cm / 100
    return weight_kg / (height_m * height_m)


def calculate_bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> float:
    """Calculate BMR using Mifflin-St Jeor Equation (evidence-based)."""
    if sex == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate TDEE based on BMR and activity level."""
    activity_multipliers: Dict[str, float] = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extra_active": 1.9,
    }
    return bmr * activity_multipliers[activity_level]


def calculate_macros(tdee: float, goal: str) -> Dict[str, float]:
    """Calculate macronutrient ratios based on evidence-based guidelines."""
    nutrition_config = NUTRITION_FOCUS[goal]
    
    # Adjust TDEE based on goal
    target_calories = tdee * (1 + nutrition_config["calorie_adjustment"])
    
    # Calculate macros
    protein = (target_calories * nutrition_config["protein_ratio"]) / 4  # 4 cal/g
    carbs = (target_calories * nutrition_config["carbs_ratio"]) / 4      # 4 cal/g
    fat = (target_calories * nutrition_config["fat_ratio"]) / 9          # 9 cal/g

    return {
        "protein": round(protein, 1),
        "carbs": round(carbs, 1),
        "fat": round(fat, 1),
        "target_calories": round(target_calories)
    }


def select_exercises_for_goal(goal: str, focus_areas: List[str], count: int = 5) -> List[Dict[str, Any]]:
    """Select exercises based on scientific principles and workout goals."""
    # Filter exercises by difficulty appropriate for goal
    if goal == "gain_muscle":
        eligible_exercises = [ex for ex in EXERCISES if ex["difficulty"] in ["beginner", "intermediate"]]
    else:
        eligible_exercises = [ex for ex in EXERCISES if ex["difficulty"] == "beginner"]
    
    # Prioritize compound movements for efficiency and hormone response
    compound_exercises = [ex for ex in eligible_exercises if ex.get("compound", False)]
    isolation_exercises = [ex for ex in eligible_exercises if not ex.get("compound", False)]
    
    # Select based on goal principles
    selected = []
    
    if goal == "lose_weight":
        # Focus on full body, metabolic compounds
        selected.extend(compound_exercises[:3])  # 3 compound movements
        if len(selected) < count:
            selected.extend(isolation_exercises[:2])  # Fill with isolation
    elif goal == "gain_muscle":
        # Focus on compound movements for major muscle groups + isolation for detail
        selected.extend(compound_exercises[:4])  # 4 compound movements
        if len(selected) < count:
            selected.extend(isolation_exercises[:1])  # 1 isolation for detail work
    else:  # maintain_weight
        # Balanced approach
        selected.extend(compound_exercises[:2])
        selected.extend(isolation_exercises[:2])
        if len(selected) < count:
            remaining = [ex for ex in eligible_exercises if ex not in selected]
            selected.extend(remaining[:count - len(selected)])
    
    # Shuffle to add variety while maintaining scientific basis
    random.shuffle(selected)
    return selected[:count]


def calculate_sets_reps(goal: str, exercise: Dict[str, Any], week_number: int = 1) -> Dict[str, Any]:
    """Calculate sets and reps based on progressive overload principles."""
    focus_config = WORKOUT_FOCUS[goal]
    rep_range = focus_config["rep_range"]
    
    # Progressive overload: gradually increase volume/intensity
    if goal == "gain_muscle":
        # Linear periodization for muscle gain
        base_sets = 4
        if week_number > 4:
            base_sets = 5  # Increase volume after 4 weeks
        base_reps = f"{rep_range[0]}-{rep_range[1]}"
    elif goal == "lose_weight":
        # Higher reps for metabolic conditioning
        base_sets = 3
        base_reps = f"{rep_range[0]}-{rep_range[1]}"
    else:  # maintain_weight
        base_sets = 3
        base_reps = f"{rep_range[0]}-{rep_range[1]}"
    
    # Adjust for exercise difficulty
    if exercise["difficulty"] == "advanced":
        base_sets = max(2, base_sets - 1)
    elif exercise["difficulty"] == "beginner" and goal == "gain_muscle":
        base_sets = base_sets + 1  # More volume for beginners building foundation
    
    # Rest periods based on intensity goals
    rest_range = focus_config["rest_range"]
    rest_time = random.randint(rest_range[0], rest_range[1])
    
    return {
        "sets": base_sets,
        "reps": base_reps,
        "rest": rest_time
    }


def generate_workout_plan(user_input: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate a scientifically-based 7-day workout plan."""
    plan: List[Dict[str, Any]] = []
    
    goal = user_input["goal"]
    focus_config = WORKOUT_FOCUS[goal]
    workout_days = focus_config["weekly_frequency"]
    
    # Generate 4-week plan for progressive overload
    for week in range(1, 5):
        week_plan = []
        
        for day in range(1, 8):  # Monday=1 to Sunday=7
            is_workout_day = day in workout_days
            
            if not is_workout_day:
                week_plan.append({
                    "day": day,
                    "week": week,
                    "exercises": [],
                    "focus": "recovery"
                })
                continue
            
            # Select exercises based on scientific principles
            selected_exercises = select_exercises_for_goal(goal, focus_config["primary_focus"])
            
            # Format exercises with sets, reps, and rest based on progressive overload
            exercises = []
            for ex in selected_exercises:
                sets_reps = calculate_sets_reps(goal, ex, week)
                
                exercises.append({
                    "exerciseId": ex["id"],
                    "name": ex["name"],
                    "sets": sets_reps["sets"],
                    "reps": sets_reps["reps"],
                    "rest": sets_reps["rest"],
                    "muscle_groups": ex["muscle"],
                    "compound": ex.get("compound", False),
                    "difficulty": ex["difficulty"],
                    "primary_movers": ex.get("primary_movers", [])
                })
            
            week_plan.append({
                "day": day,
                "week": week,
                "exercises": exercises,
                "focus": focus_config["primary_focus"][0] if focus_config["primary_focus"] else "general fitness",
                "estimated_duration": len(exercises) * 8  # Rough estimate: 8 min per exercise
            })
        
        plan.extend(week_plan)
    
    return plan


def generate_nutrition_plan(user_input: Dict[str, Any], tdee: float) -> Dict[str, Any]:
    """Generate an evidence-based nutrition plan."""
    # Calculate macros and target calories
    macros_result = calculate_macros(tdee, user_input["goal"])
    target_calories = macros_result["target_calories"]
    protein_grams = macros_result["protein"]
    fat_grams = macros_result["fat"]
    carbs_grams = macros_result["carbs"]
    
    # Evidence-based meal timing and distribution
    nutrition_config = NUTRITION_FOCUS[user_input["goal"]]
    
    # Create scientifically-based meal plans
    if user_input["goal"] == "lose_weight":
        meals_data = [
            {
                "meal": "Breakfast",
                "foods": [
                    {"name": "Greek Yogurt", "grams": 200, "protein": 20, "carbs": 15, "fat": 0, "kcal": 140},
                    {"name": "Mixed Berries", "grams": 100, "protein": 1, "carbs": 12, "fat": 0, "kcal": 50},
                    {"name": "Almonds", "grams": 15, "protein": 3, "carbs": 3, "fat": 9, "kcal": 100},
                    {"name": "Chia Seeds", "grams": 10, "protein": 3, "carbs": 4, "fat": 4, "kcal": 60}
                ]
            },
            {
                "meal": "Lunch",
                "foods": [
                    {"name": "Grilled Chicken Breast", "grams": 150, "protein": 35, "carbs": 0, "fat": 3, "kcal": 165},
                    {"name": "Quinoa", "grams": 80, "protein": 6, "carbs": 25, "fat": 2, "kcal": 140},
                    {"name": "Broccoli", "grams": 150, "protein": 4, "carbs": 8, "fat": 0, "kcal": 50},
                    {"name": "Olive Oil", "grams": 10, "protein": 0, "carbs": 0, "fat": 10, "kcal": 90}
                ]
            },
            {
                "meal": "Dinner",
                "foods": [
                    {"name": "Salmon", "grams": 120, "protein": 28, "carbs": 0, "fat": 18, "kcal": 280},
                    {"name": "Sweet Potato", "grams": 200, "protein": 4, "carbs": 40, "fat": 0, "kcal": 180},
                    {"name": "Asparagus", "grams": 100, "protein": 3, "carbs": 4, "fat": 0, "kcal": 20},
                    {"name": "Lemon", "grams": 30, "protein": 0, "carbs": 2, "fat": 0, "kcal": 10}
                ]
            },
            {
                "meal": "Post-Workout Snack",
                "foods": [
                    {"name": "Whey Protein", "grams": 30, "protein": 25, "carbs": 2, "fat": 1, "kcal": 120},
                    {"name": "Banana", "grams": 100, "protein": 1, "carbs": 27, "fat": 0, "kcal": 100}
                ]
            },
            {
                "meal": "Evening Snack",
                "foods": [
                    {"name": "Cottage Cheese", "grams": 100, "protein": 14, "carbs": 4, "fat": 1, "kcal": 90},
                    {"name": "Walnuts", "grams": 10, "protein": 2, "carbs": 2, "fat": 10, "kcal": 100}
                ]
            }
        ]
    elif user_input["goal"] == "gain_muscle":
        meals_data = [
            {
                "meal": "Pre-Workout",
                "foods": [
                    {"name": "Oatmeal", "grams": 80, "protein": 5, "carbs": 27, "fat": 3, "kcal": 160},
                    {"name": "Banana", "grams": 100, "protein": 1, "carbs": 27, "fat": 0, "kcal": 100},
                    {"name": "Almond Butter", "grams": 16, "protein": 4, "carbs": 3, "fat": 9, "kcal": 100}
                ]
            },
            {
                "meal": "Post-Workout",
                "foods": [
                    {"name": "Whey Protein", "grams": 40, "protein": 32, "carbs": 4, "fat": 1, "kcal": 160},
                    {"name": "Dextrose", "grams": 50, "protein": 0, "carbs": 50, "fat": 0, "kcal": 200},
                    {"name": "Creatine", "grams": 5, "protein": 0, "carbs": 0, "fat": 0, "kcal": 0}
                ]
            },
            {
                "meal": "Lunch",
                "foods": [
                    {"name": "Lean Ground Turkey", "grams": 180, "protein": 40, "carbs": 0, "fat": 9, "kcal": 230},
                    {"name": "Brown Rice", "grams": 120, "protein": 4, "carbs": 25, "fat": 1, "kcal": 120},
                    {"name": "Spinach", "grams": 100, "protein": 3, "carbs": 2, "fat": 0, "kcal": 20},
                    {"name": "Olive Oil", "grams": 15, "protein": 0, "carbs": 0, "fat": 15, "kcal": 135}
                ]
            },
            {
                "meal": "Dinner",
                "foods": [
                    {"name": "Ribeye Steak", "grams": 150, "protein": 35, "carbs": 0, "fat": 30, "kcal": 410},
                    {"name": "Baked Potato", "grams": 200, "protein": 5, "carbs": 40, "fat": 0, "kcal": 180},
                    {"name": "Green Beans", "grams": 100, "protein": 2, "carbs": 5, "fat": 0, "kcal": 30},
                    {"name": "Butter", "grams": 10, "protein": 0, "carbs": 0, "fat": 8, "kcal": 70}
                ]
            },
            {
                "meal": "Before Bed",
                "foods": [
                    {"name": "Casein Protein", "grams": 30, "protein": 24, "carbs": 2, "fat": 1, "kcal": 120},
                    {"name": "Peanut Butter", "grams": 16, "protein": 4, "carbs": 3, "fat": 8, "kcal": 100}
                ]
            }
        ]
    else:  # maintain_weight
        meals_data = [
            {
                "meal": "Breakfast",
                "foods": [
                    {"name": "Eggs", "grams": 100, "protein": 12, "carbs": 2, "fat": 10, "kcal": 140},
                    {"name": "Whole Wheat Toast", "grams": 60, "protein": 4, "carbs": 24, "fat": 2, "kcal": 120},
                    {"name": "Avocado", "grams": 50, "protein": 1, "carbs": 3, "fat": 8, "kcal": 80}
                ]
            },
            {
                "meal": "Lunch",
                "foods": [
                    {"name": "Grilled Chicken Salad", "grams": 200, "protein": 30, "carbs": 10, "fat": 8, "kcal": 220},
                    {"name": "Sweet Potato", "grams": 150, "protein": 2, "carbs": 30, "fat": 0, "kcal": 130},
                    {"name": "Olive Oil Dressing", "grams": 10, "protein": 0, "carbs": 0, "fat": 9, "kcal": 80}
                ]
            },
            {
                "meal": "Dinner",
                "foods": [
                    {"name": "Baked Cod", "grams": 150, "protein": 30, "carbs": 0, "fat": 2, "kcal": 140},
                    {"name": "Wild Rice", "grams": 100, "protein": 4, "carbs": 22, "fat": 1, "kcal": 110},
                    {"name": "Roasted Vegetables", "grams": 150, "protein": 4, "carbs": 15, "fat": 3, "kcal": 100},
                    {"name": "Butter", "grams": 5, "protein": 0, "carbs": 0, "fat": 4, "kcal": 35}
                ]
            },
            {
                "meal": "Snack",
                "foods": [
                    {"name": "Greek Yogurt", "grams": 150, "protein": 15, "carbs": 8, "fat": 0, "kcal": 90},
                    {"name": "Honey", "grams": 15, "protein": 0, "carbs": 12, "fat": 0, "kcal": 50}
                ]
            }
        ]
    
    # Scale meals to match target calories
    current_total = sum(sum(food["kcal"] for food in meal["foods"]) for meal in meals_data)
    scale_factor = target_calories / current_total if current_total > 0 else 1
    
    # Scale each food item
    scaled_meals = []
    for meal in meals_data:
        scaled_foods = []
        for food in meal["foods"]:
            scaled_food = {
                "name": food["name"],
                "grams": food["grams"] * scale_factor,
                "kcal": food["kcal"] * scale_factor,
                "protein": food["protein"] * scale_factor,
                "carbs": food["carbs"] * scale_factor,
                "fat": food["fat"] * scale_factor,
            }
            scaled_foods.append(scaled_food)
        
        # Calculate meal totals
        meal_totals = {
            "kcal": sum(f["kcal"] for f in scaled_foods),
            "protein": sum(f["protein"] for f in scaled_foods),
            "carbs": sum(f["carbs"] for f in scaled_foods),
            "fat": sum(f["fat"] for f in scaled_foods),
        }
        
        scaled_meals.append({
            "meal": meal["meal"],
            "foods": scaled_foods,
            "total": {
                "kcal": round(meal_totals["kcal"]),
                "protein": round(meal_totals["protein"]),
                "carbs": round(meal_totals["carbs"]),
                "fat": round(meal_totals["fat"]),
            },
        })
    
    # Calculate daily totals
    daily_totals = {
        "kcal": round(sum(meal["total"]["kcal"] for meal in scaled_meals)),
        "protein": round(sum(meal["total"]["protein"] for meal in scaled_meals)),
        "carbs": round(sum(meal["total"]["carbs"] for meal in scaled_meals)),
        "fat": round(sum(meal["total"]["fat"] for meal in scaled_meals)),
    }
    
    return {
        "meals": scaled_meals,
        "dailyTotals": daily_totals,
        "targetCalories": target_calories,
        "macros": {
            "protein": round(protein_grams, 1),
            "carbs": round(carbs_grams, 1),
            "fat": round(fat_grams, 1)
        },
        "nutritionalNotes": {
            "proteinTiming": "Distribute protein intake evenly throughout the day for optimal muscle synthesis",
            "fiberGoal": "Aim for 25-35g fiber daily from vegetables, fruits, and whole grains",
            "hydration": "Drink 0.033L of water per kg of body weight daily",
            "micronutrients": "Ensure adequate vitamin D, magnesium, and zinc intake"
        }
    }
