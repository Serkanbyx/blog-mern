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
      toast.error("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Yeni şifre mevcut şifreden farklı olmalıdır.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Şifre başarıyla değiştirildi.");
    } catch (error) {
      toast.error(error.message || "Şifre değiştirilemedi.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error("Lütfen şifrenizi girin.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount({ password: deletePassword });
      logout();
      navigate("/", { replace: true });
      toast.success("Hesabınız silindi.");
    } catch (error) {
      toast.error(error.message || "Hesap silinemedi.");
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
        <h2 className="text-xl font-bold text-text mb-1">Şifre Değiştir</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirin.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text mb-1.5">
              Mevcut Şifre
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Mevcut şifreniz"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text mb-1.5">
              Yeni Şifre
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="En az 6 karakter"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1.5">
              Yeni Şifre (Tekrar)
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Yeni şifrenizi tekrar girin"
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Şifreler eşleşmiyor.</p>
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
                Değiştiriliyor...
              </>
            ) : (
              <>
                <FiLock className="h-4 w-4" />
                Şifreyi Değiştir
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
              Tehlikeli Bölge
            </h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-0.5">
              Bu işlem geri alınamaz. Tüm yazılarınız, yorumlarınız ve verileriniz kalıcı olarak silinecektir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
        >
          <FiTrash2 className="h-4 w-4" />
          Hesabımı Sil
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
              aria-label="Kapat"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-text">Hesabı Sil</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              Bu işlem kalıcıdır ve geri alınamaz. Devam etmek için şifrenizi girin.
            </p>

            <form onSubmit={handleDeleteAccount}>
              <div className="mb-5">
                <label htmlFor="deletePassword" className="block text-sm font-medium text-text mb-1.5">
                  Şifreniz
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="Şifrenizi girin"
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
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !deletePassword}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Evet, Hesabımı Sil
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
