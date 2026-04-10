import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const SIBLING_COUNT = 1;

const buildPageRange = (currentPage, totalPages) => {
  const totalSlots = SIBLING_COUNT * 2 + 5; // first + last + current + 2 siblings + 2 ellipsis slots

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
  const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + SIBLING_COUNT * 2 }, (_, i) => i + 1);
    return [...leftRange, "…", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: 3 + SIBLING_COUNT * 2 },
      (_, i) => totalPages - (3 + SIBLING_COUNT * 2) + i + 1
    );
    return [1, "…", ...rightRange];
  }

  return [1, "…", ...Array.from({ length: rightSibling - leftSibling + 1 }, (_, i) => leftSibling + i), "…", totalPages];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const baseBtn =
    "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Previous page"
        className={`${baseBtn} ${
          isFirstPage
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-text cursor-pointer"
        }`}
      >
        <HiChevronLeft size={18} />
      </button>

      {pages.map((page, idx) =>
        page === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className={`${baseBtn} text-muted-foreground cursor-default`}
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${baseBtn} cursor-pointer ${
              page === currentPage
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-text"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Next page"
        className={`${baseBtn} ${
          isLastPage
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-muted-foreground hover:bg-muted hover:text-text cursor-pointer"
        }`}
      >
        <HiChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
