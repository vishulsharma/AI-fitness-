import { useState } from 'react';

export default function ExerciseModal({ exercise, onClose }: { exercise: any; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Section */}
        {exercise.videoUrl && (
          <div className="mb-6">
            <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {!isPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex items-center justify-center bg-primary/80 backdrop-blur-sm text-white rounded-full p-4 hover:bg-primary/90 transition-colors duration-200"
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path dM="8 5v14l11-7z" />
                    </svg>
                    <span className="ml-3 text-lg font-medium">Play Demonstration</span>
                  </button>
                </div>
              ) : (
                {/* In a real app, this would be an actual YouTube iframe or video player */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="mb-2">Exercise Demonstration Video</p>
                    <p className="text-sm">[YouTube video would play here]</p>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
                    >
                      Close Video
                    </button>
                  </div>
                </div>
              )}
            </div>
            {exercise.gifUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Form Reference:</p>
                <img
                  src={exercise.gifUrl}
                  alt={`${exercise.name} form`}
                  className="w-full h-48 object-contained rounded"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Exercise Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-500">Primary Muscle Groups</h3>
              <p className="text-lg font-semibold mt-1">
                {exercise.muscle.map(m =>
                  m.charAt(0).toUpperCase() + m.slice(1)
                ).join(', ')}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Difficulty Level</h3>
              <p className="text-lg font-semibold mt-1">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  exercise.difficulty === 'beginner'
                    ? 'bg-green-100 text-green-800'
                    : exercise.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {exercise.difficulty}
                </span>
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Equipment Needed</h3>
              <p className="text-lg font-semibold mt-1">
                {exercise.equipment.length > 0
                  ? exercise.equipment.join(', ')
                  : 'Bodyweight only'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Exercise Type</h3>
              <p className="text-lg font-semibold mt-1">
                {exercise.muscle.includes('full body') || exercise.muscle.includes('core')
                  ? 'Compound/Core'
                  : 'Isolation'}
              </p>
            </div>
            {exercise.compound !== undefined && (
              <div>
                <h3 className="font-medium text-gray-500">Movement Type</h3>
                <p className="text-lg font-semibold mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    exercise.compound
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {exercise.compound ? 'Compound' : 'Isolation'}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* How to Perform */}
          <div>
            <h3 className="font-medium text-gray-500">How to Perform</h3>
            <div className="space-y-3">
              {exercise.steps && exercise.steps.map((step: string, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-gray-700">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Benefits */}
          {exercise.scientificNotes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-500">Scientific Benefits</h3>
              <div className="space-y-3">
                {exercise.scientificNotes.emgActivation && (
                  <div>
                    <h4 className="font-medium text-gray-500 mb-2">Muscle Activation (EMG):</h4>
                    <div className="space-y-1">
                      {Object.entries(exercise.scientificNotes.emgActivation).map(([muscle, level]: [string, string]) => (
                        <div key={muscle} className="flex justify-between">
                          <span className="text-gray-600">{muscle.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className={`font-medium ${level.toLowerCase() === 'very high' ? 'text-red-600' : level.toLowerCase() === 'high' ? 'text-orange-600' : level.toLowerCase() === 'moderate' ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {level}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
                {exercise.scientificNotes.biomechanics && (
                  <p className="text-gray-700">
                    <strong>Biomechanics:</strong> {exercise.scientificNotes.biomechanics}
                  </p>
                )}
                {exercise.scientificNotes.progression && (
                  <p className="text-gray-700">
                    <strong>Progression:</strong> {exercise.scientificNotes.progression}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Primary Movers */}
          {exercise.primary_movers && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-500">Primary Movers</h3>
              <p className="text-gray-700">
                {exercise.primary_movers.map(muscle =>
                  muscle.charAt(0).toUpperCase() + muscle.slice(1)
                ).join(', ')}
              </p>
            </div>
          )}

          {/* Benefits */}
          <div>
            <h3 className="font-medium text-gray-500">Benefits</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                • Builds strength in {exercise.muscle.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
              </p>
              <p className="text-gray-700">
                • Improves muscular endurance and stability
              </p>
              <p className="text-gray-700">
                • Can be modified for different fitness levels
              </p>
              {exercise.equipment.includes('bodyweight') && (
                <p className="text-gray-700">
                  • Requires no equipment - perfect for home workouts
                </p>
              )}
            </div>
          </div>

          {/* Common Mistakes */}
          <div>
            <h3 className="font-medium text-gray-500">Common Mistakes to Avoid</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                • Using momentum instead of controlled movement
              </p>
              <p className="text-gray-700">
                • Sacrificing form for speed or heavier weight
              </p>
              <p className="text-gray-700">
                • Not breathing properly throughout the movement
              </p>
              <p className="text-gray-700">
                • Not warming up properly before attempting the exercise
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Add to workout logic would go here
                alert(`${exercise.name} added to your workout!`);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add to Workout
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
