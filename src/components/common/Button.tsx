type Variant = "primary" | "secondary" | "success" | "danger";

const STYLES: Record<Variant, string> = {
  primary: "bg-[var(--brand)] text-white hover:opacity-90",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({ variant = "primary", loading, disabled, className = "", children, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${STYLES[variant]} ${className}`}
      {...rest}
    >
      {loading ? "Đang xử lý…" : children}
    </button>
  );
}
