import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FiCheck, FiBell } from "react-icons/fi";

const NOTIFICATION_TOGGLES = [
  {
    key: "notifications.postApproved",
    label: "Yazı onaylandı",
    description: "Yazınız onaylandığında bildirim alın.",
  },
  {
    key: "notifications.postRejected",
    label: "Yazı reddedildi",
    description: "Yazınız reddedildiğinde bildirim alın.",
  },
  {
    key: "notifications.newCommentOnPost",
    label: "Yazıma yeni yorum",
    description: "Biri yazınıza yorum yaptığında bildirim alın.",
  },
];

const getNotificationValue = (user, dotKey) => {
  const field = dotKey.replace("notifications.", "");
  return user?.preferences?.notifications?.[field] ?? true;
};

const SettingsNotificationsPage = () => {
  const { user, updateUserPreferences } = useAuth();
  const [savingKeys, setSavingKeys] = useState({});

  const handleToggle = useCallback(
    async (key) => {
      const currentValue = getNotificationValue(user, key);
      const newValue = !currentValue;

      setSavingKeys((prev) => ({ ...prev, [key]: "saving" }));

      try {
        await updateUserPreferences({ [key]: newValue });
        setSavingKeys((prev) => ({ ...prev, [key]: "saved" }));
        setTimeout(() => {
          setSavingKeys((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }, 1500);
      } catch {
        toast.error("Ayar kaydedilemedi.");
        setSavingKeys((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [user, updateUserPreferences]
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-1">Bildirim Ayarları</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Hangi durumlarda bildirim almak istediğinizi seçin.
      </p>

      <div className="space-y-3">
        {NOTIFICATION_TOGGLES.map(({ key, label, description }) => {
          const isEnabled = getNotificationValue(user, key);
          const status = savingKeys[key];

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {status && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {status === "saving" ? (
                      <span className="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                    ) : (
                      <FiCheck className="h-3.5 w-3.5 text-green-500" />
                    )}
                    {status === "saving" ? "Kaydediliyor..." : "Kaydedildi"}
                  </span>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={status === "saving"}
                  onClick={() => handleToggle(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    isEnabled ? "bg-primary-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <FiBell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Bildirim tercihleri gelecekteki kullanım için kaydedilir.
          E-posta bildirimleri şu anda aktif değildir.
        </p>
      </div>
    </div>
  );
};

export default SettingsNotificationsPage;
