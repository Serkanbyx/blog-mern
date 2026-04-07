import { useEffect, useRef } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const ConfirmModal = ({
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  icon = HiOutlineExclamationCircle,
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const Icon = icon;
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onCancel]);

  const confirmStyles =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-primary-600 hover:bg-primary-700 text-white";

  const iconBg =
    variant === "danger"
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-primary-100 dark:bg-primary-900/30";

  const iconColor =
    variant === "danger"
      ? "text-red-600 dark:text-red-400"
      : "text-primary-600 dark:text-primary-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={!loading ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mb-4`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>

          <h3 id="confirm-modal-title" className="text-lg font-semibold text-text mb-2">
            {title}
          </h3>

          {message && (
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
          )}
        </div>

        {children && <div className="mb-4">{children}</div>}

        <div className="flex items-center gap-3 w-full">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-card border border-border text-text hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${confirmStyles}`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "İşleniyor..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
