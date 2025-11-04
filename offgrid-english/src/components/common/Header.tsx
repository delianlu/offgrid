import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  currentItem?: number;
  totalItems?: number;
  progress?: number; // 0-100
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currentItem,
  totalItems,
  progress,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="font-semibold text-lg hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded px-2 py-1"
        >
          ← Back
        </button>

        {/* Title or Progress */}
        {title && <span className="text-sm font-medium">{title}</span>}
        {currentItem !== undefined && totalItems !== undefined && (
          <span className="text-sm font-medium">
            Question {currentItem} of {totalItems}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="bg-blue-500 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Module completion progress"
          />
        </div>
      )}
    </header>
  );
};
