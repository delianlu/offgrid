import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = true,
  type = 'button',
}) => {
  const baseClasses = 'font-bold py-4 px-6 rounded-xl shadow-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 focus:ring-gray-400 shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
