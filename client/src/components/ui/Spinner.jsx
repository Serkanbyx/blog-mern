const SIZE_MAP = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-3",
};

const Spinner = ({ size = "md", className = "" }) => (
  <div className={`flex items-center justify-center ${className}`} role="status">
    <div
      className={`rounded-full border-primary-600 border-t-transparent animate-spin ${SIZE_MAP[size]}`}
    />
    <span className="sr-only">Yükleniyor...</span>
  </div>
);

export default Spinner;
