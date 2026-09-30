import { Router } from 'express';
import db from '../lib/db.js';
import { authenticateToken } from './auth.js';

const router = Router();

// Get profile and measurements for the logged-in user
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const profileStmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
    const profile = await profileStmt.get([userId]);
    const measurementsStmt = db.prepare('SELECT * FROM measurements WHERE user_id = ?');
    const measurements = await measurementsStmt.get([userId]);

    res.json({ profile, measurements });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update or create profile
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const {
      goal,
      lifestyle,
      occupation,
      age,
      sex,
      weight,
      height,
      activity_level,
      health_issues,
    } = req.body;

    // Upsert profile
    const existingProfileStmt = db.prepare('SELECT id FROM profiles WHERE user_id = ?');
    const existingProfile = await existingProfileStmt.get([userId]);
    if (existingProfile) {
      const updateProfileStmt = db.prepare(`
        UPDATE profiles SET
          goal = ?,
          lifestyle = ?,
          occupation = ?,
          age = ?,
          sex = ?,
          weight = ?,
          height = ?,
          activity_level = ?,
          health_issues = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      await updateProfileStmt.run([
        goal,
        lifestyle,
        occupation,
        age,
        sex,
        weight,
        height,
        activity_level,
        JSON.stringify(health_issues),
        userId
      ]);
    } else {
      const insertProfileStmt = db.prepare(`
        INSERT INTO profiles (
          user_id, goal, lifestyle, occupation, age, sex, weight, height,
          activity_level, health_issues
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      await insertProfileStmt.run([
        userId,
        goal,
        lifestyle,
        occupation,
        age,
        sex,
        weight,
        height,
        activity_level,
        JSON.stringify(health_issues)
      ]);
    }

    // Upsert measurements (if provided)
    const {
      shoulder_width,
      arm_width,
      leg_width,
      waist,
      hip,
    } = req.body;

    if (shoulder_width !== undefined || arm_width !== undefined || leg_width !== undefined || waist !== undefined || hip !== undefined) {
      const existingMeasurementsStmt = db.prepare('SELECT id FROM measurements WHERE user_id = ?');
      const existingMeasurements = await existingMeasurementsStmt.get([userId]);
      if (existingMeasurements) {
        const updateMeasurementsStmt = db.prepare(`
          UPDATE measurements SET
            shoulder_width = COALESCE(?, shoulder_width),
            arm_width = COALESCE(?, arm_width),
            leg_width = COALESCE(?, leg_width),
            waist = COALESCE(?, waist),
            hip = COALESCE(?, hip),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `);
        await updateMeasurementsStmt.run([
          shoulder_width,
          arm_width,
          leg_width,
          waist,
          hip,
          userId
        ]);
      } else {
        const insertMeasurementsStmt = db.prepare(`
          INSERT INTO measurements (
            user_id, shoulder_width, arm_width, leg_width, waist, hip
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        await insertMeasurementsStmt.run([
          userId,
          shoulder_width ?? null,
          arm_width ?? null,
          leg_width ?? null,
          waist ?? null,
          hip ?? null
        ]);
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
