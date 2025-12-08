import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = true,
  type = 'button',
  className = '',
  size = 'md',
}) => {
  const baseClasses = 'font-bold rounded-xl shadow-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-95';

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-4 px-6 text-base',
    lg: 'py-5 px-8 text-lg',
  };

  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500',
    secondary: 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 focus:ring-gray-400 shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
