import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Report() {
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get('/report');
        setReport(response.data.report);
      } catch (err: any) {
        if (err.response && err.response.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load health report');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <div className="pulse-animation inline-block h-10 w-10 border-b-2 border-primary-dark"></div>
          <p className="mt-4 text-lg font-medium">Loading your health report...</p>
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
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary px-6 py-3"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-primary-dark">No Report Available</h2>
          <p className="text-base text-muted max-w-xl">
            Please complete your profile and measurements to generate a personalized health report.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary px-6 py-3"
            >
              Complete Profile
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
          <div className="px-8 py-6 border-b border-border-light">
            <h1 className="text-3xl font-bold text-white">Your Health Report</h1>
            <p className="text-lg text-white/90 mt-2">
              Personalized insights based on your profile and measurements
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-4">BMI</h2>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-primary-dark">{report.bmi}</p>
                  <span className="text-lg font-medium text-primary-dark">kg/m²</span>
                </div>
                <p className="text-lg font-medium text-primary-dark mt-4">
                  {report.category}
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-4">Metabolic Rate</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-muted">BMR (Basal)</span>
                    <p className="text-2xl font-bold text-primary-dark">{report.bmr}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-muted">TDEE (Total Daily)</span>
                    <p className="text-2xl font-bold text-primary-dark">{report.tdee}</p>
                  </div>
                </div>
                <p className="text-base text-muted mt-4">
                  calories per day
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-4">Daily Nutrition</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-muted">Protein</span>
                    <p className="text-2xl font-bold text-primary-dark">{report.macros.protein}g</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-muted">Carbohydrates</span>
                    <p className="text-2xl font-bold text-primary-dark">{report.macros.carbs}g</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-muted">Fat</span>
                    <p className="text-2xl font-bold text-primary-dark">{report.macros.fat}g</p>
                  </div>
                </div>
                <p className="text-base text-muted mt-4">
                  Based on your fitness goal
                </p>
              </div>
            </div>

            {/* Optional Measurements */}
            {report.measurements && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary-dark mb-6">Body Measurements</h2>
                <div className="grid gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Shoulder Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {report.measurements.shoulder_width} cm
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Arm Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {report.measurements.arm_width} cm
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Leg Width</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {report.measurements.leg_width} cm
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Waist</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {report.measurements.waist} cm
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-primary-dark mb-3">Hip</h3>
                    <p className="text-2xl font-bold text-primary-dark">
                      {report.measurements.hip} cm
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={() => navigate('/plan')}
                className="btn btn-primary px-8 py-4 text-lg float-animation hover-lift transition-all duration-300"
              >
                Generate Your Fitness Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
