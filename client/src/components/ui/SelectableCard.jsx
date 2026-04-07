import { FiCheck } from "react-icons/fi";

const SelectableCard = ({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all cursor-pointer ${
      selected
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
        : "border-border bg-bg hover:border-primary-300 hover:bg-muted"
    } ${className}`}
  >
    {selected && (
      <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
        <FiCheck className="h-3 w-3" />
      </span>
    )}

    {Icon && (
      <Icon
        className={`h-7 w-7 ${
          selected ? "text-primary-600" : "text-muted-foreground"
        }`}
      />
    )}

    <span
      className={`text-sm font-semibold ${
        selected ? "text-primary-600" : "text-text"
      }`}
    >
      {label}
    </span>

    {description && (
      <span className="text-xs text-muted-foreground">{description}</span>
    )}
  </button>
);

export default SelectableCard;
