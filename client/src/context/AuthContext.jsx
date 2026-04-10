import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  updatePreferences,
} from "../api/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate existing session (httpOnly cookie) on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await loginUser(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await registerUser(userData);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Cookie will expire on its own even if the request fails
    }
    setUser(null);
  }, []);

  const updateUser = useCallback(async (profileData) => {
    const { data } = await updateProfile(profileData);
    setUser(data.user);
    return data.user;
  }, []);

  const updateUserPreferences = useCallback(async (preferences) => {
    const { data } = await updatePreferences(preferences);
    setUser((prev) => ({
      ...prev,
      preferences: data.preferences,
    }));
    return data.preferences;
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";
    const isAuthor = user?.role === "author";
    const canCreatePost = isAdmin || isAuthor;

    return {
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isAuthor,
      canCreatePost,
      login,
      register,
      logout,
      updateUser,
      updateUserPreferences,
    };
  }, [user, loading, login, register, logout, updateUser, updateUserPreferences]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
