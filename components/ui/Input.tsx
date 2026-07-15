export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 ${className}`}
      {...props}
    />
  );
}