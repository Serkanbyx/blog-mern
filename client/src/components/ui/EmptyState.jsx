import { Link } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi";

const EmptyState = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  isPrivate = false,
}) => {
  const ResolvedIcon = isPrivate ? HiOutlineLockClosed : Icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {ResolvedIcon && (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <ResolvedIcon className="w-7 h-7 text-muted-foreground" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      )}

      {message && (
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      )}

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
