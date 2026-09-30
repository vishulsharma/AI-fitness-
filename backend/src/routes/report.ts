import { Router } from 'express';
import db from '../lib/db.js';
import { authenticateToken } from './auth.js';
import { generateHealthReport } from '../lib/report.js';

const router = Router();

// Get health report for the logged-in user
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const profileStmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = await profileStmt.get([userId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const measurementsStmt = db.prepare('SELECT * FROM measurements WHERE user_id = ?');
    const measurements = await measurementsStmt.get([userId]);

    // Prepare user object for report generation
    const user = {
      weight: profile.weight ?? 0,
      height: profile.height ?? 0,
      age: profile.age ?? 0,
      sex: (profile.sex as 'male' | 'female') || 'male',
      activityLevel: (profile.activity_level as
        | 'sedentary'
        | 'lightly_active'
        | 'moderately_active'
        | 'very_active'
        | 'extra_active') || 'sedentary',
      goal: (profile.goal as 'lose_weight' | 'maintain_weight' | 'gain_muscle') || 'maintain_weight',
      // optional measurements
      shoulder_width: measurements?.shoulder_width,
      arm_width: measurements?.arm_width,
      leg_width: measurements?.leg_width,
      waist: measurements?.waist,
      hip: measurements?.hip,
    };

    const report = generateHealthReport(user);

    res.json({ report });
  } catch (err: any) {
    console.error('Generate report error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
