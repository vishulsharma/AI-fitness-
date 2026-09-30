import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ExerciseModal from '../components/ExerciseModal';

export default function Plan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState<boolean>(true);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await api.get('/plan/latest');
        setPlan(response.data);
        // Set selected day to today (Monday=1, Sunday=7)
        const today = new Date().getDay();
        const dayIndex = today === 0 ? 7 : today; // Convert Sunday (0) to 7
        setSelectedDay(dayIndex);
        // Set week to current week (assuming plan starts from week 1)
        setSelectedWeek(1);
      } catch (err: any) {
        if (err.response && err.response.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load your plan');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchExercises = async () => {
      try {
        setExercisesLoading(true);
        const response = await api.get('/exercise');
        setExercises(response.data);
      } catch (err: any) {
        console.error('Failed to fetch exercises:', err);
        // Fallback to empty array - individual exercise fetch will handle errors
        setExercises([]);
      } finally {
        setExercisesLoading(false);
      }
    };

    fetchPlan();
    fetchExercises();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="pulse-animation inline-block h-10 w-10 border-b-2 border-primary-dark"></div>
          <p className="mt-4 text-lg font-medium">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary-dark">Error</h2>
          <p className="text-base text-muted">{error}</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/report')}
              className="btn btn-outline px-6 py-3"
            >
              Back to Report
            </button>
            <button
              onClick={() => {
                // Regenerate plan
              }}
              className="btn btn-primary px-6 py-3"
            >
              Generate New Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary-dark">No Plan Available</h2>
          <p className="text-base text-muted max-w-xl">
            Please generate a plan from your health report to see your personalized workout and nutrition plan.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/report')}
              className="btn btn-outline px-6 py-3"
            >
              Go to Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const getDayStatus = (dayExercises: any[]) => {
    if (dayExercises.length === 0) return 'rest';
    return 'workout';
  };

  const getExerciseById = (exerciseId: number) => {
    // First try to find in our exercises state
    const exercise = exercises.find((ex: any) => ex.id === exerciseId);
    if (exercise) {
      return exercise;
    }

    // If not found in state, return a basic object (this shouldn't happen if API works correctly)
    return { id: exerciseId, name: `Exercise ${exerciseId}`, muscle: [], equipment: [], difficulty: 'beginner' };
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-primary rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border-light flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Scientific Workout Plan</h1>
              <p className="text-lg text-white/90 mt-2">
                Evidence-based training designed for {plan.goal?.replace('_', ' ') || 'your goals'}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/report')}
                className="btn btn-outline px-6 py-3"
              >
                Back to Report
              </button>
              <button
                onClick={() => {
                  // Regenerate plan
                }}
                className="btn btn-primary px-6 py-3 float-animation hover-lift"
              >
                Generate New Plan
              </button>
            </div>
          </div>

          {/* Weekly Analysis Card */}
          <div className="px-8 py-6">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="flex justify-between items-start px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-2">Weekly Progress Analysis</h3>
                  <p className="text-base text-muted">
                    Track your adherence to the plan and see your progress over time
                  </p>
                </div>
                <div className="flex space-x-3">
                  {!weeklyAnalysis && !analysisLoading && (
                    <button
                      onClick={async () => {
                        try {
                          setAnalysisLoading(true);
                          await weeklyAnalysisAPI.generate();
                          // Refresh analysis after generation
                          const response = await weeklyAnalysisAPI.getLatest();
                          setWeeklyAnalysis(response.data);
                        } catch (err: any) {
                          setAnalysisError('Failed to generate weekly analysis');
                        } finally {
                          setAnalysisLoading(false);
                        }
                      }}
                      className="btn btn-outline px-4 py-2"
                    >
                      {analysisLoading ? 'Generating...' : 'Generate Analysis'}
                    </button>
                  )}
                  {weeklyAnalysis && (
                    <>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full
                        ${weeklyAnalysis.complianceRate.workouts >= 80
                          ? 'bg-green-100 text-green-800'
                          : weeklyAnalysis.complianceRate.workouts >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}>
                        {weeklyAnalysis.complianceRate.workouts}% Workouts
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full
                        ${weeklyAnalysis.complianceRate.nutrition >= 80
                          ? 'bg-green-100 text-green-800'
                          : weeklyAnalysis.complianceRate.nutrition >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}>
                        {weeklyAnalysis.complianceRate.nutrition}% Nutrition
                      </span>
                    </>
                  )}
                </div>
              </div>
              {weeklyAnalysis && (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted">Planned Workouts</p>
                      <p className="text-lg font-semibold text-primary-dark">
                        {weeklyAnalysis.completedWorkouts}/{weeklyAnalysis.plannedWorkouts}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Completed Nutrition</p>
                      <p className="text-lg font-semibold text-primary-dark">
                        {weeklyAnalysis.completedNutrition}/{weeklyAnalysis.plannedNutrition}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Weight Change</p>
                      <p className="text-lg font-semibold
                        ${weeklyAnalysis.weight_change > 0
                          ? 'text-red-600'
                          : weeklyAnalysis.weight_change < 0
                            ? 'text-green-600'
                            : 'text-gray-600'}">
                        {weeklyAnalysis.weight_change} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Week Period</p>
                      <p className="text-lg font-semibold text-primary-dark">
                        {new Date(weeklyAnalysis.weekStartDate).toLocaleDateString()} -
                        {new Date(new Date(weeklyAnalysis.weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {weeklyAnalysis.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-muted italic">{weeklyAnalysis.notes}</p>
                    </div>
                  )}
                </div>
              )}
              {!weeklyAnalysis && !analysisLoading && (
                <div className="px-6 py-8 text-center">
                  <p className="text-base text-muted">
                    No weekly analysis available. Generate your first analysis to track progress and connect with a coach for personalized feedback.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 py-6 border-b border-border-light">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('workout')}
                className={`px-4 py-3 text-lg font-medium ${
                  activeTab === 'workout'
                    ? 'btn btn-primary'
                    : 'btn btn-outline'
                }`}
              >
                Workout Plan
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`px-4 py-3 text-lg font-medium ${
                  activeTab === 'nutrition'
                    ? 'btn btn-primary'
                    : 'btn btn-outline'
                }`}
              >
                Nutrition Plan
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {activeTab === 'workout' ? (
              <div className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">Weekly Workout Schedule</h2>
                  <p className="text-lg text-muted">
                    Follow this evidence-based plan to reach your fitness goals. Each exercise includes form demonstration videos.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Week Selector */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-primary-dark">Training Week:</h3>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4].map((week) => (
                        <button
                          key={week}
                          onClick={() => setSelectedWeek(week)}
                          className={`px-4 py-2 rounded ${
                            selectedWeek === week
                              ? 'bg-primary text-white'
                              : 'bg-white/20 text-white/80 hover:bg-white/30'
                          }`}
                        >
                          Week {week}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {plan.workoutPlan
                      .filter((dayPlan: any) => dayPlan.week === selectedWeek)
                      .map((dayPlan: any, index: number) => (
                        <div
                          key={dayPlan.day}
                          className={`border rounded-xl p-6 ${
                            dayPlan.day === selectedDay
                              ? 'border-primary border-primary/20 bg-primary/5'
                              : 'border-border-light hover:border-primary hover:bg-primary/5'
                          } cursor-pointer float-animation hover-lift transition-all duration-300`}
                          onClick={() => setSelectedDay(dayPlan.day)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-primary-dark">
                                {daysOfWeek[dayPlan.day - 1]}
                              </h3>
                              <p className="text-lg text-muted mt-2">
                                {getDayStatus(dayPlan.exercises) === 'rest'
                                  ? 'Rest Day - Recovery Essential'
                                  : `${dayPlan.exercises.length} exercises`}
                              </p>
                              {dayPlan.focus && (
                                <p className="text-sm text-primary-dark/80 mt-1">
                                  Focus: {dayPlan.focus}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {dayPlan.day === selectedDay && (
                                <span className="bg-primary text-white text-sm px-3 py-1 rounded-full float-animation">
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>

                          {dayPlan.exercises.length > 0 && (
                            <div className="mt-6 space-y-4">
                              {dayPlan.exercises.map((exercise: any, exIndex: number) => (
                                <div
                                  key={`${dayPlan.day}-${exIndex}`}
                                  className="flex items-start space-x-4 hover:bg-primary/5 transition-colors duration-200 cursor-pointer"
                                  onClick={() => {
                                    const exerciseDetails = getExerciseById(exercise.exerciseId);
                                    setSelectedExercise(exerciseDetails);
                                  }}
                                >
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                                      {exIndex + 1}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-lg font-medium text-primary-dark">{exercise.name}</h4>
                                    <p className="text-base text-muted mt-2">
                                      {exercise.sets} sets × {exercise.reps} reps
                                    </p>
                                    <p className="text-base text-muted">
                                      {exercise.rest}s rest between sets
                                    </p>
                                    {exercise.compound && (
                                      <span className="bg-primary/20 text-primary-dark text-xs px-2 py-0.5 rounded-full mr-2">
                                        Compound
                                      </span>
                                    )}
                                    {exercise.difficulty && (
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                                        exercise.difficulty === 'beginner'
                                          ? 'bg-green-100 text-green-800'
                                          : exercise.difficulty === 'intermediate'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                      }`}>
                                        {exercise.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0">
                                    {/* Video thumbnail */}
                                    {getExerciseById(exercise.exerciseId).videoUrl && (
                                      <div className="flex-shrink-0">
                                        <div className="relative w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                          <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path dM="8 5v14l11-7z" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {dayPlan.exercises.length === 0 && (
                            <div className="mt-6 text-center text-muted">
                              <p>Rest day - recovery is essential for muscle growth and repair!</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">Daily Nutrition Plan</h2>
                  <p className="text-lg text-muted">
                    Evidence-based nutrition to support your {plan.goal?.replace('_', ' ') || 'fitness goals'}.
                  </p>
                </div>

                {/* Daily Totals */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-primary-dark mb-4">Daily Targets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-base text-muted">Calories</p>
                      <p className="text-2xl font-bold text-primary-dark">
                        {plan.nutritionPlan.targetCalories || plan.nutritionPlan.dailyTotals.kcal}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base text-muted">Protein</p>
                      <p className="text-2xl font-bold text-primary-dark">
                        {plan.nutritionPlan.macros?.protein || plan.nutritionPlan.dailyTotals.protein}g
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base text-muted">Carbs</p>
                      <p className="text-2xl font-bold text-primary-dark">
                        {plan.nutritionPlan.macros?.carbs || plan.nutritionPlan.dailyTotals.carbs}g
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base text-muted">Fat</p>
                      <p className="text-2xl font-bold text-primary-dark">
                        {plan.nutritionPlan.macros?.fat || plan.nutritionPlan.dailyTotals.fat}g
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-6">
                  {plan.nutritionPlan.meals.map((meal: any, mealIndex: number) => (
                    <div key={mealIndex} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-primary-dark">{meal.meal}</h3>
                        <div className="text-base text-muted">
                          {meal.total.kcal} kcal • {meal.total.protein}p • {
                            meal.total.carbs
                          }c • {meal.total.fat}f
                        </div>
                      </div>

                      <div className="space-y-4">
                        {meal.foods.map((food: any, foodIndex: number) => (
                          <div
                            key={foodIndex}
                            className="flex items-start space-x-4"
                          >
                            <div className="flex-shrink-0">
                              <div className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                                {foodIndex + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-primary-dark">{food.name}</h4>
                              <p className="text-base text-muted mt-2">
                                {food.grams}g • {food.kcal} kcal • {food.protein}p • {
                                  food.carbs
                                }c • {food.fat}f
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Nutritional Notes */}
                {plan.nutritionPlan.nutritionalNotes && (
                  <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary-dark mb-4">Nutritional Guidelines</h3>
                      <div className="space-y-3">
                        <p className="text-base text-muted">• {plan.nutritionPlan.nutritionalNotes.proteinTiming}</p>
                        <p className="text-base text-muted">• {plan.nutritionPlan.nutritionalNotes.fiberGoal}</p>
                        <p className="text-base text-muted">• {plan.nutritionPlan.nutritionalNotes.hydration}</p>
                        <p className="text-base text-muted">• {plan.nutritionPlan.nutritionalNotes.micronutrients}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div)
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Request Coach Review Button */}
    <div className="fixed bottom-6 right-6">
      <button
        onClick={async () => {
          // In a real app, this would navigate to a coach matching system or show a modal
          // For now, we'll show an alert
          alert('Feature coming soon: Connect with a certified fitness coach to review your weekly analysis and get personalized guidance!');
        }}
        className="btn btn-primary px-6 py-3 float-animation hover-lift shadow-lg"
      >
        Request Coach Review
      </button>
    </div>

    {/* Exercise Modal */}
    {selectedExercise && (
      <ExerciseModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    )}
  );
}
