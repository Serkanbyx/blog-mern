import { usePreferences } from "../../context/PreferencesContext";
import toast from "react-hot-toast";
import { FiSun, FiMoon, FiMonitor, FiCheck } from "react-icons/fi";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Açık",
    description: "Açık arka plan",
    icon: FiSun,
  },
  {
    value: "dark",
    label: "Koyu",
    description: "Koyu arka plan",
    icon: FiMoon,
  },
  {
    value: "system",
    label: "Sistem",
    description: "Cihaz ayarını takip et",
    icon: FiMonitor,
  },
];

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Küçük", preview: "14px" },
  { value: "medium", label: "Orta", preview: "16px" },
  { value: "large", label: "Büyük", preview: "18px" },
];

const DENSITY_OPTIONS = [
  {
    value: "compact",
    label: "Sıkışık",
    description: "Daha fazla içerik, daha az boşluk",
  },
  {
    value: "comfortable",
    label: "Rahat",
    description: "Dengeli boşluk ve içerik",
  },
  {
    value: "spacious",
    label: "Geniş",
    description: "Daha fazla boşluk, rahat okuma",
  },
];

const SettingsAppearancePage = () => {
  const { theme, fontSize, contentDensity, animationsEnabled, updatePreference } =
    usePreferences();

  const handleChange = async (key, value) => {
    try {
      await updatePreference(key, value);
    } catch {
      toast.error("Ayar kaydedilemedi.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <h2 className="text-xl font-bold text-text mb-1">Tema</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Uygulama görünümünü tercihlerinize göre ayarlayın.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("theme", value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all cursor-pointer ${
                  isActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-border bg-bg hover:border-primary-300 hover:bg-muted"
                }`}
              >
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                    <FiCheck className="h-3 w-3" />
                  </span>
                )}
                <Icon
                  className={`h-7 w-7 ${
                    isActive ? "text-primary-600" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-primary-600" : "text-text"
                  }`}
                >
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Font Size */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-1">Yazı Boyutu</h2>
        <p className="text-sm text-muted-foreground mb-4">
          İçerik metinlerinin boyutunu değiştirin.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {FONT_SIZE_OPTIONS.map(({ value, label, preview }) => {
            const isActive = fontSize === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("fontSize", value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-text hover:bg-muted/80"
                }`}
              >
                {label} ({preview})
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-border bg-bg p-4">
          <p
            className="text-text"
            style={{ fontSize: fontSize === "small" ? 14 : fontSize === "large" ? 18 : 16 }}
          >
            Bu bir önizleme metnidir. Seçtiğiniz yazı boyutu ile içerikler böyle görünecektir.
          </p>
        </div>
      </section>

      {/* Content Density */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-1">İçerik Yoğunluğu</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sayfa elemanları arasındaki boşluk miktarını ayarlayın.
        </p>

        <div className="space-y-2">
          {DENSITY_OPTIONS.map(({ value, label, description }) => {
            const isActive = contentDensity === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("contentDensity", value)}
                className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-border bg-bg hover:border-primary-300"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? "border-primary-600 bg-primary-600"
                      : "border-muted-foreground"
                  }`}
                >
                  {isActive && <FiCheck className="h-3 w-3 text-white" />}
                </span>
                <div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-primary-600" : "text-text"
                    }`}
                  >
                    {label}
                  </span>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-1">Animasyonlar</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Sayfa geçişleri ve hover efektlerini kontrol edin.
        </p>

        <div className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text">Animasyonları Etkinleştir</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sayfa geçişleri ve hover efektlerini aç/kapat.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={animationsEnabled}
            onClick={() => handleChange("animationsEnabled", !animationsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              animationsEnabled ? "bg-primary-600" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                animationsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsAppearancePage;
