import React from 'react';

interface AnswerOptionProps {
  letter: string; // A, B, C, D
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  letter,
  text,
  selected,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative z-10 w-full rounded-xl p-4 text-left transition-all duration-200
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
        active:scale-[0.99]
        ${selected
          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
          : 'bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      role="radio"
      aria-checked={selected}
    >
      <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
        {/* Letter Badge */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${selected
              ? 'bg-blue-500'
              : 'bg-gray-100'
            }
          `}
          style={{ minWidth: '40px', marginRight: '12px' }}
        >
          <span className={`font-bold ${selected ? 'text-white' : 'text-gray-600'}`}>
            {letter}
          </span>
        </div>

        {/* Answer Text */}
        <span className="text-lg font-medium text-gray-900">
          {text}
        </span>
      </div>
    </button>
  );
};
