import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useEffect } from "react";

const AuthorRoute = () => {
  const { isAuthenticated, canCreatePost, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && !canCreatePost) {
      toast.error("Bu alana erişmek için yazar olmanız gerekiyor.");
    }
  }, [loading, isAuthenticated, canCreatePost]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canCreatePost) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthorRoute;
