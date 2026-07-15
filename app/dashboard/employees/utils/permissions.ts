export function canManageCompensation(role?: string | null) {
  return role === "admin" || role === "hr";
}