/**
 * Short date format: "7 Nis 2026"
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Long date format: "7 Nisan 2026"
 */
export const formatDateLong = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Join date format (month + year only): "Nisan 2026"
 */
export const formatJoinDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });
};
