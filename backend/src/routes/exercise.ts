import { Router } from 'express';
import { authenticateToken } from './auth.js';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Get all exercises
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const exercisesPath = path.resolve(__dirname, '../../../ai-service/data/exercises.json');
    const exercisesData = fs.readFileSync(exercisesPath, 'utf8');
    const exercises = JSON.parse(exercisesData);

    res.json(exercises);
  } catch (err: any) {
    console.error('Get exercises error:', err);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get exercise by ID
router.get('/:exerciseId', authenticateToken, async (req: any, res: any) => {
  try {
    const exerciseId = parseInt(req.params.exerciseId);
    const exercisesPath = path.resolve(__dirname, '../../../ai-service/data/exercises.json');
    const exercisesData = fs.readFileSync(exercisesPath, 'utf8');
    const exercises: any[] = JSON.parse(exercisesData);

    const exercise = exercises.find((ex: any) => ex.id === exerciseId);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (err: any) {
    console.error('Get exercise by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

export default router;