import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { profileSchema } from '../lib/zod/schemas';
import { z } from 'zod';

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    goal: '' as const,
    lifestyle: '',
    occupation: '',
    age: '',
    sex: '' as const,
    weight: '',
    height: '',
    activity_level: '' as const,
    health_issues: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [newIssue, setNewIssue] = useState('');

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleHealthIssueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIssue(e.target.value);
  };

  const addHealthIssue = () => {
    if (newIssue.trim()) {
      setHealthIssues((prev) => [...prev, newIssue.trim()]);
      setNewIssue('');
    }
  };

  const removeHealthIssue = (index: number) => {
    setHealthIssues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = {
        ...form,
        health_issues: healthIssues,
      };
      profileSchema.parse(data);
      const response = await api.post('/profile', data);
      // Assuming the endpoint returns success
      navigate('/measurements');
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
        <h2 className="text-center text-2xl font-bold">Tell Us About Yourself</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium mb-1">
              Primary Goal
            </label>
            <select
              id="goal"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.goal}
              onChange={handleChange('goal')}
            >
              <option value="">Select a goal</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="maintain_weight">Maintain Weight</option>
              <option value="gain_muscle">Gain Muscle</option>
            </select>
          </div>
          <div>
            <label htmlFor="lifestyle" className="block text-sm font-medium mb-1">
              Lifestyle (e.g., sedentary, active, etc.)
            </label>
            <input
              id="lifestyle"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.lifestyle}
              onChange={handleChange('lifestyle')}
            />
          </div>
          <div>
            <label htmlFor="occupation" className="block text-sm font-medium mb-1">
              Occupation
            </label>
            <input
              id="occupation"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.occupation}
              onChange={handleChange('occupation')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.age}
                onChange={handleChange('age')}
              />
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium mb-1">
                Sex
              </label>
              <select
                id="sex"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.sex}
                onChange={handleChange('sex')}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium mb-1">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.weight}
                onChange={handleChange('weight')}
              />
            </div>
            <div>
              <label htmlFor="height" className="block text-sm font-medium mb-1">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.height}
                onChange={handleChange('height')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="activity_level" className="block text-sm font-medium mb-1">
              Activity Level
            </label>
            <select
              id="activity_level"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.activity_level}
              onChange={handleChange('activity_level')}
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
              <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
              <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
              <option value="extra_active">Extra active (very hard exercise & physical job)</option>
            </select>
          </div>
          <div>
            <label htmlFor="health_issues" className="block text-sm font-medium mb-1">
              Health Issues (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="health_issue_input"
                type="text"
                placeholder="e.g., diabetes, hypertension"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newIssue}
                onChange={handleHealthIssueChange}
              />
              <button
                onClick={addHealthIssue}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            {healthIssues.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="font-medium">Added issues:</p>
                {healthIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>{issue}</span>
                    <button
                      onClick={() => removeHealthIssue(index)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to Measurements'}
          </button>
        </form>
      </div>
    </div>
  );
}
