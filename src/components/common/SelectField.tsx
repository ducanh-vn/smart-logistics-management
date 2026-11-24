interface Option {
  value: string | number;
  label: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
}

export function SelectField({ label, options, error, placeholder, className = "", ...rest }: Props) {
  const select = (
    <select
      className={`${className.includes("w-") ? "" : "w-full "}rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)] ${error ? "border-rose-400" : "border-slate-300"} ${label ? "mt-1" : ""} ${className}`}
      {...rest}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {select}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
