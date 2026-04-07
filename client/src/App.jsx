import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { usePreferences } from "./context/PreferencesContext";
import ScrollToTop from "./components/ScrollToTop";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import SettingsLayout from "./layouts/SettingsLayout";

// Route Guards
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminRoute from "./components/routes/AdminRoute";
import AuthorRoute from "./components/routes/AuthorRoute";
import GuestOnlyRoute from "./components/routes/GuestOnlyRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PostDetailPage from "./pages/PostDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected Pages
import BecomeAuthorPage from "./pages/BecomeAuthorPage";

// Author Pages
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import MyPostsPage from "./pages/MyPostsPage";

// Settings Pages
import SettingsProfilePage from "./pages/settings/SettingsProfilePage";
import SettingsAccountPage from "./pages/settings/SettingsAccountPage";
import SettingsAppearancePage from "./pages/settings/SettingsAppearancePage";
import SettingsPrivacyPage from "./pages/settings/SettingsPrivacyPage";
import SettingsNotificationsPage from "./pages/settings/SettingsNotificationsPage";
import SettingsContentPage from "./pages/settings/SettingsContentPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminAuthorRequestsPage from "./pages/admin/AdminAuthorRequestsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminPendingPostsPage from "./pages/admin/AdminPendingPostsPage";
import AdminCommentsPage from "./pages/admin/AdminCommentsPage";

const App = () => {
  const { animationsEnabled } = usePreferences();

  return (
    <>
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-card-surface)",
            color: "var(--color-card-text)",
            border: "1px solid var(--color-border-line)",
          },
        }}
        containerStyle={{
          transition: animationsEnabled ? undefined : "none",
        }}
      />

      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="posts/:slug" element={<PostDetailPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />

          {/* Guest-only routes */}
          <Route element={<GuestOnlyRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes (any authenticated user) */}
          <Route element={<ProtectedRoute />}>
            <Route path="become-author" element={<BecomeAuthorPage />} />
          </Route>

          {/* Author routes */}
          <Route element={<AuthorRoute />}>
            <Route path="posts/new" element={<CreatePostPage />} />
            <Route path="posts/mine" element={<MyPostsPage />} />
            <Route path="posts/:id/edit" element={<EditPostPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Settings routes (protected, within MainLayout) */}
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<SettingsProfilePage />} />
              <Route path="account" element={<SettingsAccountPage />} />
              <Route path="appearance" element={<SettingsAppearancePage />} />
              <Route path="privacy" element={<SettingsPrivacyPage />} />
              <Route path="notifications" element={<SettingsNotificationsPage />} />
              <Route path="content" element={<SettingsContentPage />} />
            </Route>
          </Route>
        </Route>

        {/* Admin routes (own layout, no MainLayout) */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUserDetailPage />} />
            <Route path="author-requests" element={<AdminAuthorRequestsPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="posts/pending" element={<AdminPendingPostsPage />} />
            <Route path="comments" element={<AdminCommentsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
