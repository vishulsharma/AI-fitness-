import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { measurementsSchema } from '../lib/zod/schemas';
import { z } from 'zod';

export default function Measurements() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shoulder_width: '',
    arm_width: '',
    leg_width: '',
    waist: '',
    hip: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = {
        shoulder_width: form.shoulder_width ? parseFloat(form.shoulder_width) : undefined,
        arm_width: form.arm_width ? parseFloat(form.arm_width) : undefined,
        leg_width: form.leg_width ? parseFloat(form.leg_width) : undefined,
        waist: form.waist ? parseFloat(form.waist) : undefined,
        hip: form.hip ? parseFloat(form.hip) : undefined,
      };
      // Validate with Zod (optional fields)
      measurementsSchema.parse(data);
      const response = await api.post('/profile', data);
      // Assuming the endpoint returns success
      navigate('/report');
    } catch (err: any) {
      if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl space-y-6">
        <h2 className="text-center text-2xl font-bold">Optional Body Measurements</h2>
        <p className="text-center text-gray-600">
          These measurements help create more personalized plans (optional)
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="shoulder_width" className="block text-sm font-medium mb-1">
                Shoulder Width (cm)
              </label>
              <input
                id="shoulder_width"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.shoulder_width}
                onChange={handleChange('shoulder_width')}
                placeholder="e.g., 45"
              />
            </div>
            <div>
              <label htmlFor="arm_width" className="block text-sm font-medium mb-1">
                Arm Width (cm)
              </label>
              <input
                id="arm_width"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.arm_width}
                onChange={handleChange('arm_width')}
                placeholder="e.g., 30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="leg_width" className="block text-sm font-medium mb-1">
                Leg Width (cm)
              </label>
              <input
                id="leg_width"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.leg_width}
                onChange={handleChange('leg_width')}
                placeholder="e.g., 55"
              />
            </div>
            <div>
              <label htmlFor="waist" className="block text-sm font-medium mb-1">
                Waist (cm)
              </label>
              <input
                id="waist"
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.waist}
                onChange={handleChange('waist')}
                placeholder="e.g., 80"
              />
            </div>
          </div>
          <div>
            <label htmlFor="hip" className="block text-sm font-medium mb-1">
              Hip (cm)
            </label>
            <input
              id="hip"
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.hip}
              onChange={handleChange('hip')}
              placeholder="e.g., 90"
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Skip if you prefer not to share these measurements
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Skip to Report'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
