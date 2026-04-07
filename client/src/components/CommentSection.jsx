import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlineChatAlt,
  HiOutlineLogin,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  getComments,
  createComment,
  deleteComment,
} from "../api/services/commentService";
import { formatDate } from "../utils/formatDate";
import { COMMENTS_PER_PAGE } from "../utils/constants";

const CommentSection = ({ postId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Comment form state
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(
    async (targetPage = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const { data } = await getComments(postId, {
          page: targetPage,
          limit: COMMENTS_PER_PAGE,
        });

        setComments((prev) =>
          append ? [...prev, ...data.comments] : data.comments
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalComments(data.totalComments);
      } catch {
        if (!append) setComments([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !loadingMore) {
      fetchComments(page + 1, true);
    }
  }, [page, totalPages, loadingMore, fetchComments]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || submitting) return;

      setSubmitting(true);

      // Optimistic comment
      const optimisticComment = {
        _id: `temp-${Date.now()}`,
        text: trimmed,
        user: { _id: user._id, name: user.name, avatar: user.avatar },
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };

      setComments((prev) => [optimisticComment, ...prev]);
      setTotalComments((c) => c + 1);
      setText("");

      try {
        const { data } = await createComment(postId, { text: trimmed });

        setComments((prev) =>
          prev.map((c) => (c._id === optimisticComment._id ? data.comment : c))
        );
      } catch {
        // Revert on failure
        setComments((prev) =>
          prev.filter((c) => c._id !== optimisticComment._id)
        );
        setTotalComments((c) => c - 1);
        setText(trimmed);
        toast.error("Yorum gönderilemedi.");
      } finally {
        setSubmitting(false);
      }
    },
    [text, submitting, user, postId]
  );

  const handleDelete = useCallback(
    async (commentId) => {
      const prevComments = comments;
      const prevTotal = totalComments;

      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((c) => c - 1);

      try {
        await deleteComment(commentId);
        toast.success("Yorum silindi.");
      } catch {
        setComments(prevComments);
        setTotalComments(prevTotal);
        toast.error("Yorum silinemedi.");
      }
    },
    [comments, totalComments]
  );

  return (
    <section id="comments" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <HiOutlineChatAlt className="w-6 h-6 text-text" />
        <h2 className="text-xl font-semibold text-text">
          Yorumlar
          {totalComments > 0 && (
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({totalComments})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Form or Login Prompt */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-border shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300 shrink-0 mt-0.5">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Düşüncelerinizi paylaşın..."
              rows={3}
              maxLength={2000}
              className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor..." : "Yorum Yap"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-xl">
          <HiOutlineLogin className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Sohbete katılmak için giriş yapın.
          </p>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <CommentsSkeleton />
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <HiOutlineChatAlt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}

          {/* Load More */}
          {page < totalPages && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-card border border-border text-text hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

/* ─── Single Comment ─── */
const CommentItem = ({ comment, currentUserId, isAdmin, onDelete }) => {
  const isOwner = currentUserId && comment.user?._id === currentUserId;
  const canDelete = isOwner || isAdmin;

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl transition-colors ${
        comment._optimistic ? "opacity-60" : "hover:bg-muted/30"
      }`}
    >
      <Link
        to={`/profile/${comment.user?._id}`}
        className="shrink-0"
      >
        {comment.user?.avatar ? (
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            className="w-9 h-9 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300">
            {comment.user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/profile/${comment.user?._id}`}
            className="text-sm font-medium text-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
          >
            {comment.user?.name}
          </Link>
          <time className="text-xs text-muted-foreground shrink-0">
            {formatDate(comment.createdAt)}
          </time>
        </div>
        <p className="text-sm text-text leading-relaxed whitespace-pre-line wrap-break-word">
          {comment.text}
        </p>
      </div>

      {canDelete && !comment._optimistic && (
        <button
          onClick={() => onDelete(comment._id)}
          aria-label="Yorumu sil"
          className="shrink-0 p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/* ─── Loading Skeleton ─── */
const CommentsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex gap-3 p-4">
        <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default CommentSection;
