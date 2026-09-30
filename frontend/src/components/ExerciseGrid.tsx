import { useState } from 'react';
import ExerciseModal from './ExerciseModal';

const EXERCISES = [
  { id: 1, name: 'Push-up', muscle: ['chest', 'shoulders', 'triceps'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 2, name: 'Squat', muscle: ['quads', 'glutes', 'hamstrings'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 3, name: 'Pull-up', muscle: ['back', 'biceps'], equipment: ['pullup bar'], difficulty: 'intermediate' },
  { id: 4, name: 'Deadlift', muscle: ['hamstrings', 'glutes', 'lower back'], equipment: ['barbell'], difficulty: 'advanced' },
  { id: 5, name: 'Bench Press', muscle: ['chest', 'shoulders', 'triceps'], equipment: ['barbell', 'bench'], difficulty: 'beginner' },
  { id: 6, name: 'Overhead Press', muscle: ['shoulders', 'triceps'], equipment: ['barbell'], difficulty: 'beginner' },
  { id: 7, name: 'Barbell Row', muscle: ['back', 'biceps'], equipment: ['barbell'], difficulty: 'beginner' },
  { id: 8, name: 'Lunge', muscle: ['quads', 'glutes'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 9, name: 'Plank', muscle: ['core'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 10, name: 'Burpee', muscle: ['full body'], equipment: ['bodyweight'], difficulty: 'intermediate' },
  { id: 11, name: 'Lunges', muscle: ['quads', 'glutes'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 12, name: 'Mountain Climber', muscle: ['core', 'shoulders'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 13, name: 'Jumping Jacks', muscle: ['full body'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 14, name: 'High Knees', muscle: ['legs', 'core'], equipment: ['bodyweight'], difficulty: 'beginner' },
  { id: 15, name: 'Glute Bridge', muscle: ['glutes', 'hamstrings'], equipment: ['bodyweight'], difficulty: 'beginner' },
];

export default function ExerciseGrid() {
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Exercise Library</h2>
      <p className="text-gray-600 mb-6">
        Browse exercises to learn proper form and technique
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXERCISES.map(exercise => (
          <div
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="cursor-pointer border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600">{exercise.name.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">{exercise.name}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {exercise.muscle.map(m =>
                    m.charAt(0).toUpperCase() + m.slice(1)
                  ).join(', ')}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200">
                    {exercise.difficulty}
                  </span>
                  {exercise.equipment.map((eq: string, index: index) => (
                    <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Modal */}
      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </div>
  );
}