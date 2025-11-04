import React from 'react';

interface FeedbackBoxProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const FeedbackBox: React.FC<FeedbackBoxProps> = ({
  type,
  title,
  message,
  children,
}) => {
  const styles = {
    success: {
      bg: 'bg-green-100',
      border: 'border-green-500',
      icon: '✓',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
      messageColor: 'text-green-800',
    },
    error: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      icon: '✗',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
    },
    info: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      icon: 'ℹ',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-800',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} rounded-xl p-5 shadow-md`}>
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${style.iconColor}`}>{style.icon}</div>
        <div className="flex-1">
          <p className={`font-bold ${style.titleColor} text-lg mb-2`}>
            {title}
          </p>
          <p className={`${style.messageColor}`}>
            {message}
          </p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
};

interface ExplanationBoxProps {
  title?: string;
  children: React.ReactNode;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  title = "Why this is correct:",
  children,
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-bold text-gray-900 mb-2">{title}</p>
      <div className="text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

interface ComparisonBoxProps {
  frenchText: string;
  englishText: string;
  highlightEnglish?: string;
}

export const ComparisonBox: React.FC<ComparisonBoxProps> = ({
  frenchText,
  englishText,
  highlightEnglish,
}) => {
  const renderEnglish = () => {
    if (!highlightEnglish) return englishText;

    const index = englishText.toLowerCase().indexOf(highlightEnglish.toLowerCase());
    if (index === -1) return englishText;

    return (
      <>
        {englishText.substring(0, index)}
        <span className="text-green-600 font-bold">
          {englishText.substring(index, index + highlightEnglish.length)}
        </span>
        {englishText.substring(index + highlightEnglish.length)}
      </>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* French (Wrong) */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
        <p className="text-xs font-bold text-red-700 mb-1">❌ French</p>
        <p className="text-sm text-gray-700 font-medium">{frenchText}</p>
      </div>

      {/* English (Correct) */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
        <p className="text-xs font-bold text-green-700 mb-1">✓ English</p>
        <p className="text-sm text-gray-700 font-medium">{renderEnglish()}</p>
      </div>
    </div>
  );
};
