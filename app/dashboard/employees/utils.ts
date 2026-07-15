// =====================================
// Currency
// =====================================

export function formatCurrency(
  amount: number | null | undefined,
  currency = "USD"
) {
  if (amount == null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHourlyRate(
  amount: number | null | undefined,
  currency = "USD"
) {
  if (amount == null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// =====================================
// Date
// =====================================

export function formatDate(date: string | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// =====================================
// Date + Time
// =====================================

export function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// =====================================
// Initials
// =====================================

export function getInitials(
  firstName?: string | null,
  lastName?: string | null
) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

// =====================================
// Full Name
// =====================================

export function getFullName(
  firstName?: string | null,
  lastName?: string | null
) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

// =====================================
// Phone
// =====================================

export function formatPhone(phone?: string | null) {
  if (!phone) return "—";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }

  return phone;
}

// =====================================
// Percent
// =====================================

export function formatPercent(value?: number | null) {
  if (value == null) return "—";

  return `${value}%`;
}

// =====================================
// File Size
// =====================================

export function formatFileSize(bytes?: number | null) {
  if (bytes == null) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];

  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(1)} ${units[unit]}`;
}

// =====================================
// Employment Badge Color
// =====================================

export function getEmploymentStatusColor(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";

    case "on_leave":
      return "bg-yellow-100 text-yellow-700";

    case "terminated":
      return "bg-red-100 text-red-700";

    case "inactive":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

// =====================================
// Document Badge Color
// =====================================

export function getDocumentStatusColor(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700";

    case "needs_review":
      return "bg-orange-100 text-orange-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "ai_extracted":
      return "bg-purple-100 text-purple-700";

    case "uploaded":
      return "bg-gray-100 text-gray-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// =====================================
// Leave Badge Color
// =====================================

export function getLeaveStatusColor(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "rejected":
      return "bg-red-100 text-red-700";

    case "cancelled":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

// =====================================
// Performance Rating Color
// =====================================

export function getPerformanceRatingColor(rating?: string | null) {
  switch (rating?.toLowerCase()) {
    case "excellent":
      return "bg-green-100 text-green-700";

    case "exceeds expectations":
      return "bg-emerald-100 text-emerald-700";

    case "meets expectations":
      return "bg-blue-100 text-blue-700";

    case "needs improvement":
      return "bg-yellow-100 text-yellow-700";

    case "unsatisfactory":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}