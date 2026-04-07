const GUEST_LIKES_KEY = "guestLikedPosts";

/**
 * Read guest-liked post IDs from localStorage as a Set
 */
export const getGuestLikedSet = (fingerprint) => {
  try {
    const stored = localStorage.getItem(`${GUEST_LIKES_KEY}_${fingerprint}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

/**
 * Persist guest-liked post IDs Set to localStorage
 */
export const persistGuestLikedSet = (fingerprint, likedSet) => {
  try {
    localStorage.setItem(
      `${GUEST_LIKES_KEY}_${fingerprint}`,
      JSON.stringify([...likedSet])
    );
  } catch {
    /* localStorage full or unavailable */
  }
};
