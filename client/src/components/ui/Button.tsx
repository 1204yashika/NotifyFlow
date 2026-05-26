interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

export default function Button({
  children,
  isLoading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#534AB7] text-white hover:bg-[#4338a0]',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost:   'text-gray-600 hover:bg-gray-100',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}