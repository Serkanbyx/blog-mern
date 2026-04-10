import { useState, useCallback } from "react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FiCheck, FiBell } from "react-icons/fi";
import ToggleSwitch from "../../components/ui/ToggleSwitch";

const NOTIFICATION_TOGGLES = [
  {
    key: "notifications.postApproved",
    label: "Post approved",
    description: "Get notified when your post is approved.",
  },
  {
    key: "notifications.postRejected",
    label: "Post rejected",
    description: "Get notified when your post is rejected.",
  },
  {
    key: "notifications.newCommentOnPost",
    label: "New comment on my post",
    description: "Get notified when someone comments on your post.",
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
        toast.error("Could not save setting.");
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
      <h2 className="text-xl font-bold text-text mb-1">Notification settings</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Choose when you want to receive notifications.
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
                    {status === "saving" ? "Saving..." : "Saved"}
                  </span>
                )}

                <ToggleSwitch
                  checked={isEnabled}
                  onChange={() => handleToggle(key)}
                  disabled={status === "saving"}
                  ariaLabel={label}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
        <FiBell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Notification preferences are saved for future use.
          Email notifications are not enabled at this time.
        </p>
      </div>
    </div>
  );
};

export default SettingsNotificationsPage;
