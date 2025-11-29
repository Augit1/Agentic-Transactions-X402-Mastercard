import React from 'react';
import type { TimelineStepProps } from '../../types';


//Component PAra Mostrar un paso individual en la línea de tiempo.
const TimelineStep: React.FC<TimelineStepProps> = ({ title, status, stepIndex }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  return (
    <div className={`flex items-start mb-4 ${isActive ? 'font-semibold' : 'text-gray-400'}`}>
      {/* Círculo de estado */}
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 mr-4 transition-colors duration-300
          ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-700 text-gray-500'}`}
      >
        {isCompleted ? '✅' : stepIndex + 1}
      </div>
      <p className={`text-sm pt-1 ${isCompleted ? 'text-green-300' : isActive ? 'text-white' : 'text-gray-400'}`}>
        {title}
      </p>
    </div>
  );
};

export default TimelineStep;