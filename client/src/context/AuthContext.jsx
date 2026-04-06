import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePreferences,
} from "../api/services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (credentials) => {
    const { data } = await loginUser(credentials);
    const { token: newToken, user: userData } = data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await registerUser(userData);
    const { token: newToken, user: newUser } = data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
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
    const isAuthenticated = !!user && !!token;
    const isAdmin = user?.role === "admin";
    const isAuthor = user?.role === "author";
    const canCreatePost = isAdmin || isAuthor;

    return {
      user,
      token,
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
  }, [user, token, loading, login, register, logout, updateUser, updateUserPreferences]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
