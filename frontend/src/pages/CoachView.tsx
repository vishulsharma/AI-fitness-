import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function CoachView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [progressAdjustment, setProgressAdjustment] = useState<any>(null);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await api.get(`/profile/${userId}`);
        setProfile(profileResponse.data);

        // Fetch user's health report
        try {
          const reportResponse = await api.get(`/report/${userId}`);
          setReport(reportResponse.data.report);
        } catch (reportErr) {
          setReport(null);
        }

        // Fetch user's latest plan
        try {
          const planResponse = await api.get(`/plan/${userId}/latest`);
          setPlan(planResponse.data);
        } catch (planErr) {
          setPlan(null);
        }

        // Fetch coach notes for this user
        try {
          const notesResponse = await api.get(`/coach/${userId}/notes`);
          setNotes(notesResponse.data);
        } catch (notesErr) {
          setNotes([]);
        }
      } catch (err: any) {
        if (err.response && err.response.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setNoteLoading(true);
    setNoteError(null);

    try {
      const response = await api.post(`/coach/${userId}/notes`, { note: newNote });
      setNotes(prev => [...prev, response.data]);
      setNewNote('');
    } catch (err: any) {
      if (err.response && err.response.data?.error) {
        setNoteError(err.response.data.error);
      } else {
        setNoteError('Failed to add note');
      }
    } finally {
      setNoteLoading(false);
    }
  };

  const handleWeeklyAnalysis = async () => {
    if (!profile) return;

    setAnalysisLoading(true);
    try {
      const response = await api.post(`/coach/weekly-analysis`, {
        userId,
        weight: profile.weight,
        goal: profile.goal,
        weeksTrained: 4, // Default assumption - in real app this would come from tracking data
        adherenceRate: 0.85 // Default assumption
      });
      setWeeklyAnalysis(response.data);
    } catch (err: any) {
      if (err.response && err.response.data?.error) {
        setNoteError(err.response.data.error);
      } else {
        setNoteError('Failed to generate weekly analysis');
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleProgressAdjustment = async () => {
    if (!profile || !plan) return;

    setAdjustmentLoading(true);
    try {
      // In a real app, this would use actual progress data
      const response = await api.post(`/coach/progress-adjustment`, {
        userId,
        weight: profile.weight,
        goal: profile.goal,
        weeksTrained: 4,
        weightChange: profile.goal === 'lose_weight' ? -2 : profile.goal === 'gain_muscle' ? 1.5 : 0 // Example changes
      });
      setProgressAdjustment(response.data);
    } catch (err: any) {
      if (err.response && err.response.data?.error) {
        setNoteError(err.response.data.error);
      } else {
        setNoteError('Failed to generate progress adjustment');
      }
    } finally {
      setAdjustmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="pulse-animation inline-block h-10 w-10 border-b-2 border-primary-dark"></div>
          <p className="mt-4 text-lg font-medium">Loading user data...</p>
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
              onClick={() => navigate('/')}
              className="btn btn-outline px-6 py-3"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary-dark">User Not Found</h2>
          <p className="text-base text-muted">
            The user with ID {userId} could not be found.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="btn btn-outline px-6 py-3"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-primary rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border-light flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Coach View: {profile.name || 'Unnamed User'}
              </h1>
              <p className="text-lg text-white/90 mt-2">
                User ID: {profile.id}
              </p>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline px-6 py-3"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 py-6 border-b border-border-light">
            <div className="flex space-x-4">
              <button
                onClick={() => {}}
                className="btn btn-primary px-6 py-3"
              >
                User Profile
              </button>
              <button
                onClick={() => {}}
                className="btn btn-outline px-6 py-3"
              >
                Health Report
              </button>
              <button
                onClick={() => {}}
                className="btn btn-outline px-6 py-3"
              >
                Workout Plan
              </button>
              <button
                onClick={() => {}}
                className="btn btn-outline px-6 py-3"
              >
                Nutrition Plan
              </button>
              <button
                onClick={() => {}}
                className="btn btn-outline px-6 py-3"
              >
                Coach Notes
              </button>
              <button
                onClick={handleWeeklyAnalysis}
                disabled={analysisLoading}
                className="btn btn-primary px-6 py-3"
              >
                Weekly Analysis
              </button>
              <button
                onClick={handleProgressAdjustment}
                disabled={adjustmentLoading}
                className="btn btn-primary px-6 py-3"
              >
                Progress Adjustment
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* User Profile Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">User Profile</h2>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Name</h3>
                  <p className="text-xl font-bold">{profile.name || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Email</h3>
                  <p className="text-xl font-bold">{profile.email}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Age</h3>
                  <p className="text-xl font-bold">{profile.age || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Sex</h3>
                  <p className="text-xl font-bold">{profile.sex || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Weight</h3>
                  <p className="text-xl font-bold">
                    {profile.weight ? `${profile.weight} kg` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Height</h3>
                  <p className="text-xl font-bold">
                    {profile.height ? `${profile.height} cm` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Goal</h3>
                  <p className="text-xl font-bold">
                    {profile.goal
                      ? profile.goal
                          .replace('_', ' ')
                          .replace(/\b\w/g, c => c.toUpperCase())
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Activity Level</h3>
                  <p className="text-xl font-bold">
                    {profile.activity_level
                      ? profile.activity_level
                          .replace('_', ' ')
                          .replace(/\b\w/g, c => c.toUpperCase())
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Lifestyle</h3>
                  <p className="text-xl font-bold">{profile.lifestyle || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark mb-3">Occupation</h3>
                  <p className="text-xl font-bold">{profile.occupation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Optional Measurements Section */}
            {profile.measurements && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-dark mb-4">Body Measurements</h2>
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Shoulder Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {profile.measurements.shoulder_width} cm
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Arm Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {profile.measurements.arm_width} cm
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Leg Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {profile.measurements.leg_width} cm
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Waist</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {profile.measurements.waist} cm
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Hip</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {profile.measurements.hip} cm
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Health Report Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Health Report</h2>
              {report ? (
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary-dark mb-3">BMI</h3>
                      <p className="text-2xl font-bold text-primary-dark">{report.bmi}</p>
                      <p className="text-lg font-medium text-primary-dark mt-2">{report.category}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary-dark mb-3">BMR</h3>
                      <p className="text-2xl font-bold text-primary-dark">{report.bmr}</p>
                      <p className="text-lg font-medium text-primary-dark mt-2">cal/day</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary-dark mb-3">TDEE</h3>
                      <p className="text-2xl font-bold text-primary-dark">{report.tdee}</p>
                      <p className="text-lg font-medium text-primary-dark mt-2">cal/day</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-primary-dark mb-3">Daily Macros</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-muted">Protein:</span>
                          <p className="text-base font-mono text-primary-dark">{report.macros.protein}g</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-muted">Carbs:</span>
                          <p className="text-base font-mono text-primary-dark">{report.macros.carbs}g</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-muted">Fat:</span>
                          <p className="text-base font-mono text-primary-dark">{report.macros.fat}g</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-muted">
                    Health report not available. Please ensure the user has completed their profile.
                  </p>
                </div>
              )}
            </div>

            {/* Plan Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Latest Plan</h2>
              {plan ? (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-lg text-muted">
                      Week of {new Date(plan.weekStartDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Workout Plan Summary */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Workout Plan</h3>
                    <p className="text-lg text-muted">
                      {plan.workoutPlan.length} days of workouts planned
                    </p>
                    <div className="mt-4">
                      {plan.workoutPlan.map((day: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-lg mb-2"
                        >
                          <span className="text-lg font-medium">
                            <strong>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</strong>:{
                    ' '}
                            {day.exercises.length > 0
                              ? `${day.exercises.length} exercises`
                              : 'Rest'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Plan Summary */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Nutrition Plan</h3>
                    <p className="text-lg text-muted">
                      {plan.nutritionPlan.dailyTotals.kcal} kcal/day • {
                        plan.nutritionPlan.dailyTotals.protein
                      }p • {plan.nutritionPlan.dailyTotals.carbs}c • {
                        plan.nutritionPlan.dailyTotals.fat
                      }f
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-muted">
                    No plan available. Please generate a plan from the health report first.
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Analysis Section */}
            {weeklyAnalysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-dark mb-4">Weekly Analysis & Recommendations</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <p className="text-base text-muted"><strong>Analysis Date:</strong> {new Date(weeklyAnalysis.analysisDate).toLocaleDateString()}</p>
                    <p className="text-base text-muted"><strong>Weeks Trained:</strong> {weeklyAnalysis.weeksTrained}</p>
                    <p className="text-base text-muted"><strong>Adherence Rate:</strong> {(weeklyAnalysis.adherenceRate * 100).toFixed(0)}%</p>
                    <p className="text-base text-muted"><strong>Expected Progress:</strong> {weeklyAnalysis.expectedProgress.toFixed(1)} kg</p>
                    <p className="text-base text-muted">{weeklyAnalysis.progressMessage}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Coach Notes</h3>
                    <p className="text-base text-muted">{weeklyAnalysis.coachNotes}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {weeklyAnalysis.recommendations.map((rec: string, index: number) => (
                        <p key={index} className="text-gray-700">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Next Steps</h3>
                    <div className="space-y-2">
                      {weeklyAnalysis.nextSteps.map((step: string, index: number) => (
                        <p key={index} className="text-gray-700">
                          • {step}
                        </p>
                      ))}
                    </div
                  </div>
                </div>
              </div>
            )}

            {/* Progress Adjustment Section */}
            {progressAdjustment && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-dark mb-4">Progress-Based Adjustments</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <p className="text-base text-muted"><strong>Analysis Date:</strong> {new Date(progressAdjustment.analysisDate).toLocaleDateString()}</p>
                    <p className="text-base text-muted"><strong>Rationale:</strong> {progressAdjustment.adjustments.rationale}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Workout Adjustments</h3>
                    {progressAdjustment.adjustments.workoutAdjustments.length > 0 ? (
                      <div className="space-y-2">
                        {progressAdjustment.adjustments.workoutAdjustments.map((adj: string, index: number) => (
                          <p key={index} className="text-gray-700">
                            • {adj}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700">No specific workout adjustments recommended at this time.</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Nutrition Adjustments</h3>
                    {progressAdjustment.adjustments.nutritionAdjustments.length > 0 ? (
                      <div className="space-y-2">
                        {progressAdjustment.adjustments.nutritionAdjustments.map((adj: string, index: number) => (
                          <p key={index} className="text-gray-700">
                            • {adj}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700">No specific nutrition adjustments recommended at this time.</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Expected vs Actual Progress</h3>
                    <div className="space-y-2">
                      <p className="text-base text-muted"><strong>Expected Change:</strong> {progressAdjustment.expectedVsActual.expectedChange.toFixed(1)} kg</p>
                      <p className="text-base text-muted"><strong>Actual Change:</strong> {progressAdjustment.expectedVsActual.actualChange.toFixed(1)} kg</p>
                      <p className="text-base text-muted"><strong>Variance:</strong> {progressAdjustment.expectedVsActual.variance.toFixed(1)} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coach Notes Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Coach Notes</h2>
              {notes.length > 0 ? (
                <div className="space-y-6">
                  {notes.map((note: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-primary border-primary/20 bg-primary/5 p-6 mb-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-primary-dark">Coach Note</h3>
                        <p className="text-base text-muted">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-base text-muted">{note.note}</p>
                    </div>
                  ))}

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Add a Note</h3>
                    <div className="flex gap-4">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your note here..."
                        className="flex-1 min-h-[96px] px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark resize-y"
                        rows={4}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading}
                        className="btn btn-primary px-6 py-3 float-animation hover-lift"
                      >
                        {noteLoading ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>
                    {noteError && (
                      <p className="mt-2 text-sm text-red-600">{noteError}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-muted">
                    No notes yet. Be the first to add a note for this user!
                  </p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Add a Note</h3>
                    <div className="flex gap-4">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write your note here..."
                        className="flex-1 min-h-[96px] px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark resize-y"
                        rows={4}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={noteLoading}
                        className="btn btn-primary px-6 py-3 float-animation hover-lift"
                      >
                        {noteLoading ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>
                    {noteError && (
                      <p className="mt-2 text-sm text-red-600">{noteError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
