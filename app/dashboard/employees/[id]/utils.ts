export function getManagerName(
  manager?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null
) {
  if (!manager) return null;

  const name = [manager.first_name, manager.last_name]
    .filter(Boolean)
    .join(" ");

  return name || null;
}