import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";

const PreferencesContext = createContext(null);

const DEFAULT_PREFERENCES = {
  theme: "system",
  fontSize: "medium",
  contentDensity: "comfortable",
  animationsEnabled: true,
  language: "tr",
  postsPerPage: 10,
  defaultSort: "newest",
};

const getStoredPreferences = () => {
  try {
    const stored = localStorage.getItem("guestPreferences");
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const { user, isAuthenticated, updateUserPreferences } = useAuth();

  const [preferences, setPreferences] = useState(() => {
    if (user?.preferences) {
      return { ...DEFAULT_PREFERENCES, ...user.preferences };
    }
    return getStoredPreferences();
  });

  // Sync preferences when user logs in/out
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...user.preferences });
    } else if (!isAuthenticated) {
      setPreferences(getStoredPreferences());
    }
  }, [user, isAuthenticated]);

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;

    const applyTheme = (isDark) => {
      html.classList.toggle("dark", isDark);
    };

    if (preferences.theme === "dark") {
      applyTheme(true);
    } else if (preferences.theme === "light") {
      applyTheme(false);
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handler = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [preferences.theme]);

  // Apply font size to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("text-size-small", "text-size-medium", "text-size-large");
    html.classList.add(`text-size-${preferences.fontSize}`);
  }, [preferences.fontSize]);

  // Apply content density to <body>
  useEffect(() => {
    const body = document.body;
    body.classList.remove("density-compact", "density-comfortable", "density-spacious");
    body.classList.add(`density-${preferences.contentDensity}`);
  }, [preferences.contentDensity]);

  // Apply animations toggle to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (preferences.animationsEnabled) {
      html.classList.remove("animations-disabled");
      html.classList.add("animations-enabled");
    } else {
      html.classList.remove("animations-enabled");
      html.classList.add("animations-disabled");
    }
  }, [preferences.animationsEnabled]);

  const updatePreference = useCallback(
    async (key, value) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));

      if (isAuthenticated) {
        try {
          await updateUserPreferences({ [key]: value });
        } catch {
          console.warn(`Failed to sync preference "${key}" to server.`);
        }
      } else {
        try {
          const stored = getStoredPreferences();
          localStorage.setItem(
            "guestPreferences",
            JSON.stringify({ ...stored, [key]: value })
          );
        } catch {
          console.warn(`Failed to save preference "${key}" to localStorage.`);
        }
      }
    },
    [isAuthenticated, updateUserPreferences]
  );

  const value = useMemo(
    () => ({
      ...preferences,
      updatePreference,
    }),
    [preferences, updatePreference]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesContext;
