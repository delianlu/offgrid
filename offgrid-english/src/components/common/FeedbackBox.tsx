import React from 'react';
import { AudioButton } from './AudioButton';

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
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-500 dark:border-green-400',
      icon: '✓',
      iconColor: 'text-green-500 dark:text-green-400',
      titleColor: 'text-green-900 dark:text-green-100',
      messageColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-500 dark:border-red-400',
      icon: '✗',
      iconColor: 'text-red-500 dark:text-red-400',
      titleColor: 'text-red-900 dark:text-red-100',
      messageColor: 'text-red-800 dark:text-red-200',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-500 dark:border-blue-400',
      icon: 'ℹ',
      iconColor: 'text-blue-500 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-100',
      messageColor: 'text-blue-800 dark:text-blue-200',
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-5 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💡</span>
        <p className="text-sm font-bold text-blue-900">{title}</p>
      </div>
      <div className="text-sm text-gray-800 leading-relaxed pl-8">
        {children}
      </div>
    </div>
  );
};

interface ComparisonBoxProps {
  frenchText: string;
  englishText: string;
  highlightEnglish?: string;
  whyDifficult?: string;
}

export const ComparisonBox: React.FC<ComparisonBoxProps> = ({
  frenchText,
  englishText,
  highlightEnglish,
  whyDifficult,
}) => {
  const renderEnglish = () => {
    if (!highlightEnglish) return englishText;

    const index = englishText.toLowerCase().indexOf(highlightEnglish.toLowerCase());
    if (index === -1) return englishText;

    return (
      <>
        {englishText.substring(0, index)}
        <span className="bg-green-200 text-green-800 px-1 rounded font-bold">
          {englishText.substring(index, index + highlightEnglish.length)}
        </span>
        {englishText.substring(index + highlightEnglish.length)}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {whyDifficult && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
          <p className="text-sm font-bold text-yellow-800 uppercase mb-1">Why is this difficult?</p>
          <p className="text-gray-800">{whyDifficult}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* French (Source of Error) */}
        <div className="relative overflow-hidden bg-white border-2 border-red-100 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-bl-lg">
            FRENCH PATTERN
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl">🇫🇷</span>
            <p className="text-lg text-gray-600 font-medium italic line-through decoration-red-400 decoration-2">
              {frenchText}
            </p>
          </div>
        </div>

        {/* English (Correct Pattern) */}
        <div className="relative overflow-hidden bg-white border-2 border-green-100 rounded-xl p-4 shadow-sm">
          <div className="absolute top-0 right-0 bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-bl-lg">
            ENGLISH PATTERN
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl">🇬🇧</span>
            <div className="flex-1">
              <p className="text-lg text-gray-900 font-bold">
                {renderEnglish()}
              </p>
            </div>
            <AudioButton text={englishText} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
