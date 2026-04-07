import { usePreferences } from "../../hooks/usePreferences";
import toast from "react-hot-toast";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import SelectableCard from "../../components/ui/SelectableCard";

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
          {THEME_OPTIONS.map(({ value, label, description, icon }) => (
            <SelectableCard
              key={value}
              selected={theme === value}
              onClick={() => handleChange("theme", value)}
              icon={icon}
              label={label}
              description={description}
            />
          ))}
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
              <SelectableCard
                key={value}
                selected={isActive}
                onClick={() => handleChange("contentDensity", value)}
                label={label}
                description={description}
                className="flex-row! items-center! p-4! rounded-lg! border! gap-3"
              />
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
          <ToggleSwitch
            checked={animationsEnabled}
            onChange={(val) => handleChange("animationsEnabled", val)}
            ariaLabel="Animasyonları aç/kapat"
          />
        </div>
      </section>
    </div>
  );
};

export default SettingsAppearancePage;
