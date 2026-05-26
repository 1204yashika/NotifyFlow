interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
          ${error
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-200 focus:border-[#534AB7]'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}