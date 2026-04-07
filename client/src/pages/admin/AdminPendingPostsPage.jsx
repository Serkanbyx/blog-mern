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
  HiOutlineDocumentText,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  getPendingPosts,
  approvePost,
  rejectPost,
} from "../../api/services/adminService";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getAvatarUrl = (user) =>
  user?.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff`;

/* ═══════════════════════════════════════════════════════════════ */

const AdminPendingPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

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
      setPosts(data.data || data.posts || []);
    } catch (err) {
      setError(err.message || "Yazılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApprove = useCallback(async (postId) => {
    if (!window.confirm("Bu yazıyı onaylamak istediğinize emin misiniz?"))
      return;

    setActionLoading(postId);
    try {
      await approvePost(postId);
      toast.success("Yazı onaylandı ve yayınlandı.");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      toast.error(err.message || "Yazı onaylanamadı.");
    } finally {
      setActionLoading(null);
    }
  }, []);

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
      toast.error("Ret sebebi zorunludur.");
      return;
    }

    const { postId } = rejectModal;
    setActionLoading(postId);
    try {
      await rejectPost(postId, rejectionReason.trim());
      toast.success("Yazı reddedildi.");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      closeRejectModal();
    } catch (err) {
      toast.error(err.message || "Yazı reddedilemedi.");
    } finally {
      setActionLoading(null);
    }
  }, [rejectModal, rejectionReason, closeRejectModal]);

  const toggleExpand = useCallback((postId) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
  }, []);

  /* ── Error state ─────────────────────────────────────── */

  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">
          Bir hata oluştu
        </h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Onay Bekleyen Yazılar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bekleyen yazıları inceleyin, onaylayın veya reddedin.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <PendingPostsSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostReviewCard
              key={post._id}
              post={post}
              isExpanded={expandedPost === post._id}
              isLoading={actionLoading === post._id}
              onToggleExpand={toggleExpand}
              onApprove={handleApprove}
              onReject={openRejectModal}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <RejectModal
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          isLoading={actionLoading === rejectModal.postId}
          onConfirm={handleReject}
          onClose={closeRejectModal}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Sub-components                                                */
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
      {/* Post Header */}
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
              {author.name || "Bilinmiyor"}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-3.5 h-3.5" />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
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

      {/* Expandable Content */}
      <button
        onClick={() => onToggleExpand(post._id)}
        className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
      >
        {isExpanded ? (
          <>
            <HiOutlineChevronUp className="w-4 h-4" />
            İçeriği Gizle
          </>
        ) : (
          <>
            <HiOutlineChevronDown className="w-4 h-4" />
            İçeriği Görüntüle
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
          <div
            className="text-sm text-text leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onApprove(post._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineCheck className="w-4 h-4" />
          Onayla
        </button>
        <button
          onClick={() => onReject(post._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineX className="w-4 h-4" />
          Reddet
        </button>
      </div>
    </div>
  );
};

const RejectModal = ({
  rejectionReason,
  setRejectionReason,
  isLoading,
  onConfirm,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text">Yazıyı Reddet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ret sebebini belirtin. Bu mesaj yazara iletilecektir.
        </p>
      </div>

      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        placeholder="Ret sebebini yazın..."
        rows={4}
        className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
        autoFocus
      />

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-text transition-colors cursor-pointer disabled:opacity-50"
        >
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || !rejectionReason.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reddediliyor...
            </>
          ) : (
            <>
              <HiOutlineX className="w-4 h-4" />
              Reddet
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-4">
      <HiOutlineCheckCircle className="w-7 h-7 text-green-500" />
    </div>
    <h3 className="text-lg font-semibold text-text mb-1">Her Şey Tamam!</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Şu anda onay bekleyen yazı bulunmuyor.
    </p>
  </div>
);

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
