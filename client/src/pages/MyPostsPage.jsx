import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineUpload,
  HiOutlineDocumentText,
  HiPlus,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { getMyPosts, deletePost, submitPost } from "../api/services/postService";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import { formatDate } from "../utils/formatDate";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "pending", label: "In review" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
];

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    postId: null,
  });

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

  const handleDelete = useCallback(async () => {
    const { postId } = deleteModal;
    setActionLoading(postId);
    try {
      await deletePost(postId);
      toast.success("Post deleted.");
      setDeleteModal({ open: false, postId: null });
      fetchPosts();
    } catch (err) {
      toast.error(err.message || "Could not delete post.");
    } finally {
      setActionLoading(null);
    }
  }, [deleteModal, fetchPosts]);

  const handleSubmit = useCallback(
    async (postId) => {
      setActionLoading(postId);
      try {
        await submitPost(postId);
        toast.success("Post sent for review.");
        fetchPosts();
      } catch (err) {
        toast.error(err.message || "Could not submit post.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchPosts]
  );

  const emptyMessages = {
    all: "You do not have any posts yet. Create your first post to get started!",
    draft: "You have no draft posts.",
    pending: "You have no posts awaiting review.",
    published: "You have no published posts yet.",
    rejected: "You have no rejected posts.",
  };

  return (
    <div className="py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-text">My posts</h1>
          <p className="text-muted-foreground">Manage all your posts.</p>
        </div>
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">New post</span>
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
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No posts found"
          message={emptyMessages[activeTab]}
          actionLabel={activeTab === "all" ? "Create new post" : undefined}
          actionTo={activeTab === "all" ? "/posts/new" : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post._id}
                post={post}
                actionLoading={actionLoading}
                onDelete={(postId) =>
                  setDeleteModal({ open: true, postId })
                }
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

      {/* Delete Modal */}
      {deleteModal.open && (
        <ConfirmModal
          title="Delete post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmLabel="Yes, delete"
          icon={HiOutlineTrash}
          variant="danger"
          loading={actionLoading === deleteModal.postId}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ open: false, postId: null })}
        />
      )}
    </div>
  );
};

const PostRow = ({ post, actionLoading, onDelete, onSubmit }) => {
  const isLoading = actionLoading === post._id;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-card border border-border rounded-xl">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-base font-semibold text-text truncate">
            {post.title}
          </h3>
          <StatusBadge status={post.status} />
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
            Rejection reason: {post.rejectionReason}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {post.status === "draft" && (
          <>
            <Link
              to={`/posts/${post._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => onSubmit(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineUpload className="w-4 h-4" />
              Submit
            </button>
            <button
              onClick={() => onDelete(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete
            </button>
          </>
        )}

        {post.status === "pending" && (
          <span className="text-sm text-amber-600 dark:text-amber-400 italic">
            Awaiting review...
          </span>
        )}

        {post.status === "published" && (
          <Link
            to={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
            View
          </Link>
        )}

        {post.status === "rejected" && (
          <>
            <Link
              to={`/posts/${post._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <HiOutlinePencilAlt className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => onDelete(post._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete
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

export default MyPostsPage;
