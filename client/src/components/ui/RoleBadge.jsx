const ROLE_CONFIG = {
  user: {
    label: "User",
    className: "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  author: {
    label: "Author",
    className: "bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  admin: {
    label: "Admin",
    className: "bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export { ROLE_CONFIG };
export default RoleBadge;
