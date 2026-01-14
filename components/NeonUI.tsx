import React from 'react';

// Neon colors map to Tailwind classes
type NeonColor = 'blue' | 'green' | 'magenta' | 'yellow';

interface NeonCardProps {
  children: React.ReactNode;
  color?: NeonColor;
  className?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({ children, color = 'blue', className = '' }) => {
  const borderClass = {
    blue: 'border-neon-blue shadow-neon-blue',
    green: 'border-neon-green shadow-neon-green',
    magenta: 'border-neon-magenta shadow-neon-magenta',
    yellow: 'border-neon-yellow shadow-neon-yellow',
  }[color];

  return (
    <div className={`border bg-neon-card/80 backdrop-blur-md p-6 rounded-lg transition-all duration-300 ${borderClass} ${className}`}>
      {children}
    </div>
  );
};

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NeonColor;
  icon?: React.ReactNode;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ variant = 'blue', icon, children, className = '', ...props }) => {
  const colors = {
    blue: 'border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:shadow-neon-blue',
    green: 'border-neon-green text-neon-green hover:bg-neon-green/10 hover:shadow-neon-green',
    magenta: 'border-neon-magenta text-neon-magenta hover:bg-neon-magenta/10 hover:shadow-neon-magenta',
    yellow: 'border-neon-yellow text-neon-yellow hover:bg-neon-yellow/10 hover:shadow-neon-yellow',
  }[variant];

  return (
    <button
      className={`border px-4 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${colors} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  color?: NeonColor;
}

export const NeonInput: React.FC<NeonInputProps> = ({ label, color = 'blue', className = '', ...props }) => {
  const focusColor = {
    blue: 'focus:border-neon-blue focus:shadow-neon-blue',
    green: 'focus:border-neon-green focus:shadow-neon-green',
    magenta: 'focus:border-neon-magenta focus:shadow-neon-magenta',
    yellow: 'focus:border-neon-yellow focus:shadow-neon-yellow',
  }[color];

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">{label}</label>
      <input
        className={`bg-transparent border border-gray-700 text-white rounded px-3 py-2 outline-none transition-all duration-300 [color-scheme:dark] ${focusColor} ${className}`}
        {...props}
      />
    </div>
  );
};

interface NeonTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  color?: NeonColor;
}

export const NeonTextarea: React.FC<NeonTextareaProps> = ({ label, color = 'blue', className = '', ...props }) => {
  const focusColor = {
    blue: 'focus:border-neon-blue focus:shadow-neon-blue',
    green: 'focus:border-neon-green focus:shadow-neon-green',
    magenta: 'focus:border-neon-magenta focus:shadow-neon-magenta',
    yellow: 'focus:border-neon-yellow focus:shadow-neon-yellow',
  }[color];

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">{label}</label>
      <textarea
        className={`bg-transparent border border-gray-700 text-white rounded px-3 py-2 outline-none transition-all duration-300 min-h-[100px] resize-y ${focusColor} ${className}`}
        {...props}
      />
    </div>
  );
};

interface ToggleProps {
  leftLabel: string;
  rightLabel: string;
  value: boolean; // false = left, true = right
  onChange: (val: boolean) => void;
  color?: NeonColor;
}

export const NeonToggle: React.FC<ToggleProps> = ({ leftLabel, rightLabel, value, onChange, color = 'magenta' }) => {
  const activeClass = {
    blue: 'bg-neon-blue shadow-neon-blue text-black',
    green: 'bg-neon-green shadow-neon-green text-black',
    magenta: 'bg-neon-magenta shadow-neon-magenta text-black',
    yellow: 'bg-neon-yellow shadow-neon-yellow text-black',
  }[color];

  return (
    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onChange(!value)}>
      <span className={`text-sm font-bold transition-colors ${!value ? 'text-white' : 'text-gray-600'}`}>{leftLabel}</span>
      <div className={`w-14 h-7 border border-gray-600 rounded-full relative flex items-center p-1 ${value ? 'border-gray-500' : 'border-gray-500'}`}>
        <div className={`w-5 h-5 rounded-full transition-all duration-300 transform ${value ? 'translate-x-7' : 'translate-x-0'} ${activeClass}`} />
      </div>
      <span className={`text-sm font-bold transition-colors ${value ? 'text-white' : 'text-gray-600'}`}>{rightLabel}</span>
    </div>
  );
};