import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineChatAlt2,
  HiOutlineTrash,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  getAllCommentsAdmin,
  adminDeleteComment,
} from "../../api/services/adminService";
import Pagination from "../../components/Pagination";
import { formatDate } from "../../utils/formatDate";
import { getAvatarUrl } from "../../utils/helpers";

/* ═══════════════════════════════════════════════════════════════ */

const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await getAllCommentsAdmin(params);
      const result = data.data || data;
      setComments(result.comments || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message || "Something went wrong while loading comments.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    async (commentId) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this comment? This action cannot be undone."
        )
      )
        return;

      setActionLoading(commentId);
      try {
        await adminDeleteComment(commentId);
        toast.success("Comment deleted.");
        fetchComments();
      } catch (err) {
        toast.error(err.message || "Could not delete the comment.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchComments]
  );

  /* ── Error state ─────────────────────────────────────────── */

  if (error && comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Comments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all comments.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by username or post title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
        />
      </div>

      {/* Content */}
      {loading ? (
        <CommentsSkeleton />
      ) : comments.length === 0 ? (
        <EmptyState hasFilters={!!debouncedSearch} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 rounded-tl-xl">
                    User
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Comment
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Post
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 rounded-tr-xl">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comments.map((comment) => (
                  <tr
                    key={comment._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAvatarUrl(comment.user)}
                          alt={comment.user?.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                        />
                        <span className="text-sm font-medium text-text truncate max-w-[120px]">
                          {comment.user?.name || "Guest"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text line-clamp-2 max-w-[280px]">
                        {comment.content || comment.text}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/post/${comment.postId?.slug || comment.postId?._id}`}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate block max-w-[180px]"
                      >
                        {comment.postId?.title || "Deleted post"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(comment.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={actionLoading === comment._id}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Delete comment"
                      >
                        {actionLoading === comment._id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <HiOutlineTrash className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                isLoading={actionLoading === comment._id}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Sub-components                                                */
/* ═══════════════════════════════════════════════════════════════ */

const CommentCard = ({ comment, isLoading, onDelete }) => (
  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={getAvatarUrl(comment.user)}
          alt={comment.user?.name}
          className="w-8 h-8 rounded-full object-cover ring-1 ring-border shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {comment.user?.name || "Guest"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(comment._id)}
        disabled={isLoading}
        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        aria-label="Delete comment"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiOutlineTrash className="w-4 h-4" />
        )}
      </button>
    </div>

    <p className="text-sm text-text line-clamp-3">
      {comment.content || comment.text}
    </p>

    <Link
      to={`/post/${comment.postId?.slug || comment.postId?._id}`}
      className="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate block"
    >
      {comment.postId?.title || "Deleted post"}
    </Link>
  </div>
);

const EmptyState = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
      <HiOutlineChatAlt2 className="w-7 h-7 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-text mb-1">No comments found</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      {hasFilters
        ? "No comments match your search criteria."
        : "There are no comments yet."}
    </p>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const CommentsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {/* Desktop Skeleton */}
    <div className="hidden md:block bg-card border border-border rounded-xl">
      <div className="border-b border-border bg-muted/50 px-4 py-3 flex gap-4 rounded-t-xl">
        {[100, 200, 140, 80, 40].map((w, i) => (
          <div key={i} className="h-4 bg-muted rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg ml-auto" />
        </div>
      ))}
    </div>

    {/* Mobile Skeleton */}
    <div className="md:hidden space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default AdminCommentsPage;
