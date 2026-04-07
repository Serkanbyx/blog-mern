import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  getAllPostsAdmin,
  approvePost,
  rejectPost,
  adminDeletePost,
} from "../../api/services/adminService";
import Pagination from "../../components/Pagination";

const STATUS_CONFIG = {
  draft: {
    label: "Taslak",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  pending: {
    label: "Beklemede",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  published: {
    label: "Yayında",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  rejected: {
    label: "Reddedildi",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "draft", label: "Taslak" },
  { value: "pending", label: "Beklemede" },
  { value: "published", label: "Yayında" },
  { value: "rejected", label: "Reddedildi" },
];

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

const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    postId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdown]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const { data } = await getAllPostsAdmin(params);
      setPosts(data.data || data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Yazılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  }, []);

  const handleApprove = useCallback(
    async (postId) => {
      setOpenDropdown(null);
      if (!window.confirm("Bu yazıyı onaylamak istediğinize emin misiniz?"))
        return;

      setActionLoading(postId);
      try {
        await approvePost(postId);
        toast.success("Yazı onaylandı.");
        fetchPosts();
      } catch (err) {
        toast.error(err.message || "Yazı onaylanamadı.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPosts]
  );

  const openRejectModal = useCallback((postId) => {
    setOpenDropdown(null);
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
      closeRejectModal();
      fetchPosts();
    } catch (err) {
      toast.error(err.message || "Yazı reddedilemedi.");
    } finally {
      setActionLoading(null);
    }
  }, [rejectModal, rejectionReason, closeRejectModal, fetchPosts]);

  const handleDelete = useCallback(
    async (postId) => {
      setOpenDropdown(null);
      if (
        !window.confirm(
          "Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        )
      )
        return;

      setActionLoading(postId);
      try {
        await adminDeletePost(postId);
        toast.success("Yazı silindi.");
        fetchPosts();
      } catch (err) {
        toast.error(err.message || "Yazı silinemedi.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPosts]
  );

  const getAvailableActions = useCallback((status) => {
    const actions = ["view"];
    if (status === "pending" || status === "rejected") actions.push("approve");
    if (status === "pending" || status === "published") actions.push("reject");
    actions.push("delete");
    return actions;
  }, []);

  /* ── Error state ─────────────────────────────────────────── */

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

  /* ── Main render ─────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Yazılar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tüm yazıları görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Başlık veya yazar ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors cursor-pointer"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <PostsSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState hasFilters={!!(debouncedSearch || statusFilter)} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Başlık
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Yazar
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Durum
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Tarih
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text truncate block max-w-[280px]">
                        {post.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAvatarUrl(post.author)}
                          alt={post.author?.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                        />
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {post.author?.name || "Bilinmiyor"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PostActionsDropdown
                        post={post}
                        availableActions={getAvailableActions(post.status)}
                        isLoading={actionLoading === post._id}
                        isOpen={openDropdown === post._id}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === post._id ? null : post._id
                          )
                        }
                        onApprove={handleApprove}
                        onReject={openRejectModal}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                availableActions={getAvailableActions(post.status)}
                isLoading={actionLoading === post._id}
                isOpen={openDropdown === post._id}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === post._id ? null : post._id
                  )
                }
                onApprove={handleApprove}
                onReject={openRejectModal}
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

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const PostActionsDropdown = ({
  post,
  availableActions,
  isLoading,
  isOpen,
  onToggle,
  onApprove,
  onReject,
  onDelete,
}) => (
  <div className="relative inline-block">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className="p-2 rounded-lg text-muted-foreground hover:text-text hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
      aria-label="İşlemler"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <HiOutlineDotsVertical className="w-5 h-5" />
      )}
    </button>

    {isOpen && (
      <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-lg z-30 py-1">
        {availableActions.includes("view") && (
          <Link
            to={`/post/${post.slug || post._id}`}
            className="w-full text-left px-4 py-2 text-sm text-text hover:bg-muted transition-colors flex items-center gap-2"
          >
            <HiOutlineEye className="w-4 h-4 text-muted-foreground" />
            Görüntüle
          </Link>
        )}

        {availableActions.includes("approve") && (
          <button
            onClick={() => onApprove(post._id)}
            className="w-full text-left px-4 py-2 text-sm text-text hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
          >
            <HiOutlineCheck className="w-4 h-4 text-green-500" />
            Onayla
          </button>
        )}

        {availableActions.includes("reject") && (
          <button
            onClick={() => onReject(post._id)}
            className="w-full text-left px-4 py-2 text-sm text-text hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
          >
            <HiOutlineX className="w-4 h-4 text-amber-500" />
            Reddet
          </button>
        )}

        {availableActions.includes("delete") && (
          <>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => onDelete(post._id)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-2"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Sil
            </button>
          </>
        )}
      </div>
    )}
  </div>
);

const PostCard = ({
  post,
  availableActions,
  isLoading,
  isOpen,
  onToggle,
  onApprove,
  onReject,
  onDelete,
}) => (
  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text line-clamp-2">
          {post.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <img
            src={getAvatarUrl(post.author)}
            alt={post.author?.name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-border"
          />
          <span className="text-xs text-muted-foreground truncate">
            {post.author?.name || "Bilinmiyor"}
          </span>
        </div>
      </div>

      <PostActionsDropdown
        post={post}
        availableActions={availableActions}
        isLoading={isLoading}
        isOpen={isOpen}
        onToggle={onToggle}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
      />
    </div>

    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <StatusBadge status={post.status} />
      <span>{formatDate(post.createdAt)}</span>
    </div>
  </div>
);

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

const EmptyState = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
      <HiOutlineDocumentText className="w-7 h-7 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-text mb-1">Yazı Bulunamadı</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      {hasFilters
        ? "Arama kriterlerinize uygun yazı bulunamadı."
        : "Henüz hiç yazı yok."}
    </p>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const PostsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {/* Desktop Skeleton */}
    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-4 py-3 flex gap-4">
        {[160, 100, 70, 80, 60].map((w, i) => (
          <div key={i} className="h-4 bg-muted rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
        >
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="h-5 w-18 bg-muted rounded-full" />
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-18 bg-muted rounded-full" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminPostsPage;
