import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { changePassword, deleteAccount } from "../../api/services/authService";
import toast from "react-hot-toast";
import { FiLock, FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";

const SettingsAccountPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(error.message || "Could not change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error("Please enter your password.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount({ password: deletePassword });
      logout();
      navigate("/", { replace: true });
      toast.success("Your account has been deleted.");
    } catch (error) {
      toast.error(error.message || "Could not delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const passwordFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length > 0;

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <section>
        <h2 className="text-xl font-bold text-text mb-1">Change password</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Change your password regularly to keep your account secure.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text mb-1.5">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Your current password"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text mb-1.5">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter your new password"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || !passwordFormValid}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isChangingPassword ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Changing...
              </>
            ) : (
              <>
                <FiLock className="h-4 w-4" />
                Change password
              </>
            )}
          </button>
        </form>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Delete Account — Danger Zone */}
      <section className="rounded-xl border-2 border-red-200 dark:border-red-800/50 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Danger zone
            </h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-0.5">
              This action cannot be undone. All your posts, comments, and data will be permanently deleted.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
        >
          <FiTrash2 className="h-4 w-4" />
          Delete my account
        </button>
      </section>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword("");
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-text transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-text">Delete account</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              This is permanent and cannot be undone. Enter your password to continue.
            </p>

            <form onSubmit={handleDeleteAccount}>
              <div className="mb-5">
                <label htmlFor="deletePassword" className="block text-sm font-medium text-text mb-1.5">
                  Your password
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoFocus
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !deletePassword}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Yes, delete my account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAccountPage;
