interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, className = "", ...rest }: Props) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        id={inputId}
        className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)] ${error ? "border-rose-400" : "border-slate-300"} ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
