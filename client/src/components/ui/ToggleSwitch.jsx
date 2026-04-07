const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  ariaLabel,
}) => {
  const sizeStyles = {
    sm: { track: "h-5 w-9", thumb: "h-3 w-3", translate: "translate-x-4.5" },
    md: { track: "h-6 w-11", thumb: "h-4 w-4", translate: "translate-x-6" },
  };

  const { track, thumb, translate } = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${track} shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
        checked ? "bg-primary-600" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block ${thumb} rounded-full bg-white shadow-sm transition-transform ${
          checked ? translate : "translate-x-1"
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
