import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ProgressChart() {
  const [weightData, setWeightData] = useState<Array<{ date: string; weight: number }>>([]);
  const [workoutData, setWorkoutData] = useState<Array<{ date: string; completed: number }>>([]);
  const [nutritionData, setNutritionData] = useState<Array<{ date: string; completed: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // Fetch workout logs (which include weight and completion data)
        const logsResponse = await api.get('/logs');
        const logs = logsResponse.data;

        // Process weight data
        const weightEntries = logs
          .filter((log: any) => log.weight !== null && log.weight !== undefined)
          .map((log: any) => ({
            date: log.date,
            weight: log.weight,
          }))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setWeightData(weightEntries);

        // Process workout compliance data
        const workoutEntries = logs.map((log: any) => ({
          date: log.date,
          completed: log.workout_completed ? 1 : 0,
        }));
        setWorkoutData(workoutEntries);

        // Process nutrition compliance data
        const nutritionEntries = logs.map((log: any) => ({
          date: log.date,
          completed: log.nutrition_completed ? 1 : 0,
        }));
        setNutritionData(nutritionEntries);
      } catch (err: any) {
        if (err.response && err.response.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load progress data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Progress Tracking</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-medium mb-4">Weight Progress</h3>
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-medium mb-4">Workout Compliance</h3>
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-medium mb-4">Nutrition Compliance</h3>
            <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Progress Tracking</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate weekly averages for smoother charts
  const getWeeklyAverages = (data: Array<{ date: string; value: number }>) => {
    if (data.length === 0) return [];

    const grouped: Record<string, { sum: number; count: number }> = {};

    data.forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!grouped[weekKey]) {
        grouped[weekKey] = { sum: 0, count: 0 };
      }

      grouped[weekKey].sum += item.value;
      grouped[weekKey].count += 1;
    });

    return Object.keys(grouped)
      .map(weekKey => ({
        date: weekKey,
        value: grouped[weekKey].sum / grouped[weekKey].count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Prepare chart data
  const weightChartData = weightData.map(item => ({
    date: item.date,
    weight: item.weight,
  }));

  const workoutComplianceData = workoutData.map(item => ({
    date: item.date,
    completed: item.completed,
  }));

  const nutritionComplianceData = nutritionData.map(item => ({
    date: item.date,
    completed: item.completed,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Progress Tracking</h2>
      <div className="grid gap-6">
        {/* Weight Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-medium mb-4">Weight Progress (kg)</h3>
          {weightChartData.length > 0 ? (
            <div className="h-96">
              {/* In a real app, we would render a chart here using a library like Chart.js or Recharts */}
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="space-y-4">
                    {weightChartData.map((point, index) => (
                      <div key={index} className="flex items-center justify-between px-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(point.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono text-sm font-medium">{point.weight}kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500"
                  style={{ width: weightChartData.length > 0 ? (100 / Math.max(1, weightChartData.length - 1)) * (weightChartData.length - 1) + '%' : '0%' }}
                ></div>
                {weightChartData.map((point, index) => (
                  <div key={index} className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full opacity-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No weight data available. Start logging your weight to see progress!
              </p>
            </div>
          )}
        </div>

        {/* Workout Compliance Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-medium mb-4">Workout Compliance (%)</h3>
          {workoutComplianceData.length > 0 ? (
            <div className="h-96">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="space-y-4">
                    {workoutComplianceData.map((point, index) => (
                      <div key={index} className="flex items-center justify-between px-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(point.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono text-sm font-medium">{point.completed * 100}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500"
                  style={{ width: workoutComplianceData.length > 0 ? (100 / Math.max(1, workoutComplianceData.length - 1)) * (workoutComplianceData.length - 1) + '%' : '0%' }}
                ></div>
                {workoutComplianceData.map((point, index) => (
                  <div key={index} className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-600 rounded-full opacity-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No workout data available. Start logging your workouts to see compliance!
              </p>
            </div>
          )}
        </div>

        {/* Nutrition Compliance Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-medium mb-4">Nutrition Compliance (%)</h3>
          {nutritionComplianceData.length > 0 ? (
            <div className="h-96">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="space-y-4">
                    {nutritionComplianceData.map((point, index) => (
                      <div key={index} className="flex items-center justify-between px-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(point.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono text-sm font-medium">{point.completed * 100}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-yellow-500"
                  style={{ width: nutritionComplianceData.length > 0 ? (100 / Math.max(1, nutritionComplianceData.length - 1)) * (nutritionComplianceData.length - 1) + '%' : '0%' }}
                ></div>
                {nutritionComplianceData.map((point, index) => (
                  <div key={index} className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-600 rounded-full opacity-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No nutrition data available. Start logging your nutrition to see compliance!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-medium mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Current Weight</p>
            <p className="text-2xl font-bold">
              {weightChartData.length > 0
                ? `${weightChartData[weightChartData.length - 1].weight} kg`
                : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Weight Change</p>
            <p className="text-2xl font-bold">
              {weightChartData.length >= 2
                ? `${(
                    weightChartData[weightChartData.length - 1].weight -
                    weightChartData[0].weight
                  ).toFixed(1)} kg`
                : 'N/A'}
            </p>
            <p className="text-sm mt-1">
              {weightChartData.length >= 2
                ? weightChartData[weightChartData.length - 1].weight > weightChartData[0].weight
                  ? '(Gain)'
                  : '(Loss)'
                : ''}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Avg. Workout Compliance</p>
            <p className="text-2xl font-bold">
              {workoutComplianceData.length > 0
                ? `${(
                    workoutComplianceData.reduce((sum, item) => sum + item.completed, 0) /
                    workoutComplianceData.length
                  ) * 100
                .toFixed(0)}%`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}