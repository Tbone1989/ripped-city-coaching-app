import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";
  const variantClasses = {
    primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label}
    </label>
    <input
      id={id}
      className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label}
    </label>
    <select
      id={id}
      className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
      {...props}
    >
      {children}
    </select>
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
      {...props}
    ></textarea>
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-lg rounded-xl p-6 sm:p-8 ${className}`} {...props}>
    {children}
  </div>
);

export const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);


interface TabProps {
    tabs: string[];
    activeTab: string;
    onTabClick: (tab: string) => void;
}

export const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabClick }) => (
    <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab
                            ? 'border-red-500 text-red-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </nav>
    </div>
);