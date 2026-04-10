import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineExclamation,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  getPendingPosts,
  approvePost,
  rejectPost,
} from "../../api/services/adminService";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/formatDate";
import { getAvatarUrl } from "../../utils/helpers";

/* ═══════════════════════════════════════════════════════════════ */

const AdminPendingPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  const [approveModal, setApproveModal] = useState({
    open: false,
    postId: null,
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    postId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPendingPosts();
      const result = data.data || data;
      setPosts(result.posts || []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = useCallback(async () => {
    const { postId } = approveModal;
    setActionLoading(postId);
    try {
      await approvePost(postId);
      toast.success("Post approved and published.");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setApproveModal({ open: false, postId: null });
    } catch (err) {
      toast.error(err.message || "Could not approve the post.");
    } finally {
      setActionLoading(null);
    }
  }, [approveModal]);

  const openRejectModal = useCallback((postId) => {
    setRejectModal({ open: true, postId });
    setRejectionReason("");
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({ open: false, postId: null });
    setRejectionReason("");
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }

    const { postId } = rejectModal;
    setActionLoading(postId);
    try {
      await rejectPost(postId, rejectionReason.trim());
      toast.success("Post rejected.");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      closeRejectModal();
    } catch (err) {
      toast.error(err.message || "Could not reject the post.");
    } finally {
      setActionLoading(null);
    }
  }, [rejectModal, rejectionReason, closeRejectModal]);

  const toggleExpand = useCallback((postId) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
  }, []);

  if (error && posts.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Posts awaiting approval</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review pending posts, approve them, or reject them.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <PendingPostsSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={HiOutlineCheckCircle}
          title="All caught up"
          message="There are no posts awaiting approval right now."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostReviewCard
              key={post._id}
              post={post}
              isExpanded={expandedPost === post._id}
              isLoading={actionLoading === post._id}
              onToggleExpand={toggleExpand}
              onApprove={(postId) =>
                setApproveModal({ open: true, postId })
              }
              onReject={openRejectModal}
            />
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.open && (
        <ConfirmModal
          title="Approve post"
          message="Are you sure you want to approve this post?"
          confirmLabel="Approve"
          icon={HiOutlineCheck}
          variant="primary"
          loading={actionLoading === approveModal.postId}
          onConfirm={handleApprove}
          onCancel={() => setApproveModal({ open: false, postId: null })}
        />
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <ConfirmModal
          title="Reject post"
          message="Provide a rejection reason. This message will be sent to the author."
          confirmLabel="Reject"
          icon={HiOutlineX}
          variant="danger"
          loading={actionLoading === rejectModal.postId}
          onConfirm={handleReject}
          onCancel={closeRejectModal}
        >
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the rejection reason..."
            rows={4}
            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            autoFocus
          />
        </ConfirmModal>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const PostReviewCard = ({
  post,
  isExpanded,
  isLoading,
  onToggleExpand,
  onApprove,
  onReject,
}) => {
  const author = post.author || {};

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <img
          src={getAvatarUrl(author)}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-border shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text line-clamp-2">
            {post.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <HiOutlineUser className="w-3.5 h-3.5" />
              {author.name || "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-3.5 h-3.5" />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <HiOutlineTag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-muted text-xs font-medium text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => onToggleExpand(post._id)}
        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
      >
        {isExpanded ? (
          <>
            <HiOutlineChevronUp className="w-4 h-4" />
            Hide content
          </>
        ) : (
          <>
            <HiOutlineChevronDown className="w-4 h-4" />
            Show content
          </>
        )}
      </button>

      {isExpanded && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-64 object-cover rounded-lg"
            />
          )}
          <div className="text-sm text-text leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return <br key={idx} />;
              return (
                <p key={idx} className="mb-2 last:mb-0">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onApprove(post._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineCheck className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onReject(post._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineX className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton ────────────────────────────────────────────── */

const PendingPostsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-12 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="flex gap-3">
          <div className="h-9 w-24 bg-muted rounded-lg" />
          <div className="h-9 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default AdminPendingPostsPage;
