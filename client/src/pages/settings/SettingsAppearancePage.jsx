import { usePreferences } from "../../hooks/usePreferences";
import toast from "react-hot-toast";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import SelectableCard from "../../components/ui/SelectableCard";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Light background",
    icon: FiSun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dark background",
    icon: FiMoon,
  },
  {
    value: "system",
    label: "System",
    description: "Match device setting",
    icon: FiMonitor,
  },
];

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small", preview: "14px" },
  { value: "medium", label: "Medium", preview: "16px" },
  { value: "large", label: "Large", preview: "18px" },
];

const DENSITY_OPTIONS = [
  {
    value: "compact",
    label: "Compact",
    description: "More content, less spacing",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Balanced spacing and content",
  },
  {
    value: "spacious",
    label: "Spacious",
    description: "More spacing for easier reading",
  },
];

const SettingsAppearancePage = () => {
  const { theme, fontSize, contentDensity, animationsEnabled, updatePreference } =
    usePreferences();

  const handleChange = async (key, value) => {
    try {
      await updatePreference(key, value);
    } catch {
      toast.error("Could not save setting.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <h2 className="text-xl font-bold text-text mb-1">Theme</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust how the app looks to match your preferences.
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
        <h2 className="text-lg font-semibold text-text mb-1">Font size</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Change the size of body text across the app.
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
            This is preview text. Content will look like this at your chosen font size.
          </p>
        </div>
      </section>

      {/* Content Density */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-1">Content density</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Adjust how much space appears between page elements.
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
        <h2 className="text-lg font-semibold text-text mb-1">Animations</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Control page transitions and hover effects.
        </p>

        <div className="flex items-center justify-between rounded-lg border border-border bg-bg px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text">Enable animations</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turn page transitions and hover effects on or off.
            </p>
          </div>
          <ToggleSwitch
            checked={animationsEnabled}
            onChange={(val) => handleChange("animationsEnabled", val)}
            ariaLabel="Toggle animations on or off"
          />
        </div>
      </section>
    </div>
  );
};

export default SettingsAppearancePage;
