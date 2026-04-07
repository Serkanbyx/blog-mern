/**
 * Strip HTML tags and truncate content with ellipsis
 */
export const truncateContent = (content, maxLength = 150) => {
  if (!content) return "";
  const stripped = content.replace(/<[^>]*>/g, "");
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + "…";
};

/**
 * Estimate reading time in minutes (200 words/min)
 */
export const calculateReadingTime = (content) => {
  if (!content) return 1;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Generate avatar URL — uses ui-avatars.com as fallback
 */
export const getAvatarUrl = (user) =>
  user?.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "U"
  )}&background=6366f1&color=fff`;
