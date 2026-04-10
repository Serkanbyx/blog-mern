import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Large 404 */}
      <h1 className="text-[10rem] font-extrabold leading-none tracking-tight text-primary-500/20 select-none sm:text-[12rem]">
        404
      </h1>

      {/* Overlay heading */}
      <div className="-mt-16 sm:-mt-20">
        <h2 className="text-2xl font-bold text-text sm:text-3xl">
          Page not found
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The page you are looking for does not exist, may have been moved, or
          was removed.
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-muted"
        >
          <FiArrowLeft className="h-4 w-4" />
          Go back
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <FiHome className="h-4 w-4" />
          Go to home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
