import { Router } from 'express';
import db from '../lib/db.js';
import { authenticateToken } from './auth.js';
import axios from 'axios';

const router = Router();

// Get AI service URL from environment variable
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Generate a new plan for the logged-in user and save it to the database
router.post('/generate', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const profileStmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = await profileStmt.get([userId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
    }

    // Prepare user object for AI service
    const user = {
      weight: profile.weight ?? 0,
      height: profile.height ?? 0,
      age: profile.age ?? 0,
      sex: (profile.sex as 'male' | 'female') || 'male',
      activity_level: (profile.activity_level as
        | 'sedentary'
        | 'lightly_active'
        | 'moderately_active'
        | 'very_active'
        | 'extra_active') || 'sedentary',
      goal: (profile.goal as 'lose_weight' | 'maintain_weight' | 'gain_muscle') || 'maintain_weight',
    };

    // Call AI service to generate plan
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/plan`, user);
    const { workoutPlan, nutritionPlan, tdee, bmr, bmi, macros } = aiResponse.data;

    // Save the plan to the database
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Start of week (Monday)

    const insertPlanStmt = db.prepare(`
      INSERT INTO plans (user_id, week_start_date, workout_plan, nutrition_plan)
      VALUES (?, ?, ?, ?)
    `);
    const result = await insertPlanStmt.run([
      userId,
      weekStartDate.toISOString().split('T')[0],
      JSON.stringify(workoutPlan),
      JSON.stringify(nutritionPlan)
    ]);

    const planId = result.lastID;

    res.status(201).json({
      message: 'Plan generated successfully',
      planId,
      workoutPlan,
      nutritionPlan,
      tdee,
      bmr,
      bmi,
      macros,
    });
  } catch (err: any) {
    console.error('Generate plan error:', err);
    if (err.response) {
      // AI service returned an error
      res.status(err.response.status).json({ error: err.response.data?.error || 'AI service error' });
    } else {
      // Network or other error
      res.status(500).json({ error: 'Failed to connect to AI service' });
    }
  }
});

// Get the latest plan for the logged-in user
router.get('/latest', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const latestPlanStmt = db.prepare(`
      SELECT * FROM plans
      WHERE user_id = ?
      ORDER BY week_start_date DESC
      LIMIT 1
    `);
    const plan = await latestPlanStmt.get([userId]);

    if (!plan) {
      return res.status(404).json({ error: 'No plan found. Please generate a plan first.' });
    }

    res.json({
      id: plan.id,
      weekStartDate: plan.week_start_date,
      workoutPlan: JSON.parse(plan.workout_plan),
      nutritionPlan: JSON.parse(plan.nutrition_plan),
    });
  } catch (err: any) {
    console.error('Get latest plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific plan by ID
router.get('/:planId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const planId = req.params.planId;

    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const plan = await planStmt.get([planId, userId]);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({
      id: plan.id,
      weekStartDate: plan.week_start_date,
      workoutPlan: JSON.parse(plan.workout_plan),
      nutritionPlan: JSON.parse(plan.nutrition_plan),
    });
  } catch (err: any) {
    console.error('Get plan by ID error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate weekly analysis for the logged-in user
router.post('/weekly-analysis', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    // Get user's latest plan to calculate planned workouts/nutrition
    const latestPlanStmt = db.prepare(`
      SELECT * FROM plans
      WHERE user_id = ?
      ORDER BY week_start_date DESC
      LIMIT 1
    `);
    const latestPlan = await latestPlanStmt.get([userId]);

    // Get user's logs for the current week
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Start of week (Monday)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6); // End of week (Sunday)

    const logsStmt = db.prepare(`
      SELECT * FROM logs
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `);
    const logs = await logsStmt.all([userId, weekStartDate.toISOString().split('T')[0], weekEndDate.toISOString().split('T')[0]]);

    // Calculate planned vs actual
    let plannedWorkouts = 0;
    let completedWorkouts = 0;
    let plannedNutrition = 0;
    let completedNutrition = 0;

    if (latestPlan) {
      const workoutPlan = JSON.parse(latestPlan.workout_plan);
      const nutritionPlan = JSON.parse(latestPlan.nutrition_plan);

      // Count planned workouts (non-empty exercise arrays)
      plannedWorkouts = workoutPlan.filter((day: any) => day.exercises.length > 0).length;
      // For simplicity, we'll assume nutrition plan is planned for 7 days
      plannedNutrition = 7;
    }

    // Count completed workouts and nutrition from logs
    completedWorkouts = logs.filter((log: any) => log.workout_completed === 1).length;
    completedNutrition = logs.filter((log: any) => log.nutrition_completed === 1).length;

    // Calculate weight change (difference between first and last log of the week)
    let weightChange = 0;
    if (logs.length >= 2) {
      const sortedLogs = logs.slice().sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      weightChange = parseFloat(sortedLogs[sortedLogs.length - 1].weight) -
                    parseFloat(sortedLogs[0].weight);
    }

    // Save weekly analysis
    const insertAnalysisStmt = db.prepare(`
      INSERT INTO weekly_analysis (user_id, week_start_date, planned_workouts, completed_workouts,
                                 planned_nutrition, completed_nutrition, weight_change, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = await insertAnalysisStmt.run([
      userId,
      weekStartDate.toISOString().split('T')[0],
      plannedWorkouts,
      completedWorkouts,
      plannedNutrition,
      completedNutrition,
      weightChange,
      `Weekly analysis for ${weekStartDate.toDateString()} to ${weekEndDate.toDateString()}`
    ]);

    const analysisId = result.lastID;

    res.status(201).json({
      message: 'Weekly analysis generated successfully',
      analysisId,
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      plannedWorkouts,
      completedWorkouts,
      plannedNutrition,
      completedNutrition,
      weightChange,
      complianceRate: {
        workouts: plannedWorkouts > 0 ? Math.round((completedWorkouts / plannedWorkouts) * 100) : 0,
        nutrition: plannedNutrition > 0 ? Math.round((completedNutrition / plannedNutrition) * 100) : 0
      }
    });
  } catch (err: any) {
    console.error('Generate weekly analysis error:', err);
    res.status(500).json({ error: 'Failed to generate weekly analysis' });
  }
});

// Get weekly analysis for the logged-in user
router.get('/weekly-analysis', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const analysisStmt = db.prepare(`
      SELECT * FROM weekly_analysis
      WHERE user_id = ?
      ORDER BY week_start_date DESC
      LIMIT 1
    `);
    const analysis = await analysisStmt.get([userId]);

    if (!analysis) {
      return res.status(404).json({ error: 'No weekly analysis found. Please generate one first.' });
    }

    res.json({
      id: analysis.id,
      weekStartDate: analysis.week_start_date,
      plannedWorkouts: analysis.planned_workouts,
      completedWorkouts: analysis.completed_workouts,
      plannedNutrition: analysis.planned_nutrition,
      completedNutrition: analysis.completed_nutrition,
      weightChange: analysis.weight_change,
      notes: analysis.notes,
      createdAt: analysis.created_at,
      complianceRate: {
        workouts: analysis.planned_workouts > 0 ? Math.round((analysis.completed_workouts / analysis.planned_workouts) * 100) : 0,
        nutrition: analysis.planned_nutrition > 0 ? Math.round((analysis.completed_nutrition / analysis.planned_nutrition) * 100) : 0
      }
    });
  } catch (err: any) {
    console.error('Get weekly analysis error:', err);
    res.status(500).json({ error: 'Failed to retrieve weekly analysis' });
  }
});

export default router;