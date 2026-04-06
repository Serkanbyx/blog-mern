import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "guestFingerprint";

/**
 * Generates and persists a unique guest fingerprint in localStorage.
 * Used for anonymous like tracking without authentication.
 */
const useGuestFingerprint = () => {
  const [fingerprint] = useState(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const generated = uuidv4();
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  });

  return fingerprint;
};

export default useGuestFingerprint;
