import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineUpload,
  HiOutlineDocumentText,
  HiOutlineExclamation,
  HiPlus,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { getMyPosts, deletePost, submitPost } from "../api/services/postService";
import Pagination from "../components/Pagination";

const TABS = [
  { key: "all", label: "Tümü" },
  { key: "draft", label: "Taslak" },
  { key: "pending", label: "İncelemede" },
  { key: "published", label: "Yayında" },
  { key: "rejected", label: "Reddedildi" },
];

const STATUS_CONFIG = {
  draft: {
    label: "Taslak",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  pending: {
    label: "İncelemede",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  published: {
    label: "Yayında",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  rejected: {
    label: "Reddedildi",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (activeTab !== "all") params.status = activeTab;

      const { data } = await getMyPosts(params);
      setPosts(data.posts || data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    async (postId) => {
      if (!window.confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;

      setActionLoading(postId);
      try {
        await deletePost(postId);
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

  const handleSubmit = useCallback(
    async (postId) => {
      setActionLoading(postId);
      try {
        await submitPost(postId);
        toast.success("Yazı incelemeye gönderildi.");
        fetchPosts();
      } catch (err) {
        toast.error(err.message || "Yazı gönderilemedi.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPosts]
  );

  return (
    <div className="py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-text">Yazılarım</h1>
          <p className="text-muted-foreground">Tüm yazılarınızı yönetin.</p>
        </div>
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Yeni Yazı</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-card text-text shadow-sm"
                : "text-muted-foreground hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post._id}
                post={post}
                actionLoading={actionLoading}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
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

const PostRow = ({ post, actionLoading, onDelete, onSubmit }) => {
  const config = STATUS_CONFIG[post.status];
  const isLoading = actionLoading === post._id;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-card border border-border rounded-xl">
      {/* Post Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-base font-semibold text-text truncate">
            {post.title}
          </h3>
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${config.className}`}
          >
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(post.createdAt)}
          {post.tags?.length > 0 && (
            <span className="ml-2">
              {post.tags.slice(0, 3).join(", ")}
              {post.tags.length > 3 && ` +${post.tags.length - 3}`}
            </span>
          )}
        </p>
        {post.status === "rejected" && post.rejectionReason && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Ret sebebi: {post.rejectionReason}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {post.status === "draft" && (
          <>
            <Link
              to={`/posts/${post._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              Düzenle
            </Link>
            <button
              onClick={() => onSubmit(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineUpload className="w-4 h-4" />
              Gönder
            </button>
            <button
              onClick={() => onDelete(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Sil
            </button>
          </>
        )}

        {post.status === "pending" && (
          <span className="text-sm text-amber-600 dark:text-amber-400 italic">
            İnceleme bekleniyor...
          </span>
        )}

        {post.status === "published" && (
          <Link
            to={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
            Görüntüle
          </Link>
        )}

        {post.status === "rejected" && (
          <>
            <Link
              to={`/posts/${post._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              Düzenle
            </Link>
            <button
              onClick={() => onDelete(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Sil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-3 w-32 bg-muted rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-muted rounded-lg" />
      <div className="h-8 w-20 bg-muted rounded-lg" />
    </div>
  </div>
);

const EmptyState = ({ activeTab }) => {
  const messages = {
    all: "Henüz hiç yazınız yok. Yeni bir yazı oluşturarak başlayın!",
    draft: "Taslak yazınız bulunmuyor.",
    pending: "İncelemede bekleyen yazınız yok.",
    published: "Henüz yayınlanmış yazınız yok.",
    rejected: "Reddedilmiş yazınız bulunmuyor.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <HiOutlineDocumentText className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">Yazı Bulunamadı</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {messages[activeTab]}
      </p>
      {activeTab === "all" && (
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          Yeni Yazı Oluştur
        </Link>
      )}
    </div>
  );
};

export default MyPostsPage;
