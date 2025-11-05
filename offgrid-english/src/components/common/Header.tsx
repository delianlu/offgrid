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
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="font-semibold text-lg hover:bg-white/20 transition-all active:scale-95 rounded-lg px-3 py-1"
        >
          ← Back
        </button>

        {/* Title or Progress */}
        {title && <span className="text-sm font-semibold">{title}</span>}
        {currentItem !== undefined && totalItems !== undefined && (
          <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
            Question {currentItem} of {totalItems}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="bg-orange-600 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
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
