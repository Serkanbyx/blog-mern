import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FiCheck } from "react-icons/fi";
import ToggleSwitch from "../../components/ui/ToggleSwitch";

const PRIVACY_TOGGLES = [
  {
    key: "privacy.showLikedPosts",
    label: "Beğenilen yazıları profilimde göster",
    description: "Etkinleştirildiğinde, diğer kullanıcılar beğendiğiniz yazıları görebilir.",
  },
  {
    key: "privacy.showComments",
    label: "Yorumlarımı profilimde göster",
    description: "Etkinleştirildiğinde, yorumlarınız profil sayfanızda görünür.",
  },
  {
    key: "privacy.showEmail",
    label: "E-postamı profilimde göster",
    description: "Etkinleştirildiğinde, e-posta adresiniz herkese açık profilinizde görünür.",
  },
];

const getPrivacyValue = (user, dotKey) => {
  const field = dotKey.replace("privacy.", "");
  return user?.preferences?.privacy?.[field] ?? false;
};

const SettingsPrivacyPage = () => {
  const { user, updateUserPreferences } = useAuth();
  const [savingKeys, setSavingKeys] = useState({});

  const handleToggle = useCallback(
    async (key) => {
      const currentValue = getPrivacyValue(user, key);
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
      <h2 className="text-xl font-bold text-text mb-1">Gizlilik Ayarları</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Profilinizde hangi bilgilerin görüneceğini kontrol edin.
      </p>

      <div className="space-y-3">
        {PRIVACY_TOGGLES.map(({ key, label, description }) => {
          const isEnabled = getPrivacyValue(user, key);
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
    </div>
  );
};

export default SettingsPrivacyPage;
