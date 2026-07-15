export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg bg-white p-6 shadow dark:bg-slate-900 ${className}`}>
      {children}
    </div>
  );
}