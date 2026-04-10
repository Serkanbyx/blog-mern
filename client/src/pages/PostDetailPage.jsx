import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCalendar,
  HiArrowLeft,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useGuestFingerprint from "../hooks/useGuestFingerprint";
import { getPostBySlug, deletePost } from "../api/services/postService";
import { toggleLike, toggleGuestLike } from "../api/services/likeService";
import CommentSection from "../components/CommentSection";
import ConfirmModal from "../components/ui/ConfirmModal";
import { formatDateLong } from "../utils/formatDate";
import { calculateReadingTime } from "../utils/helpers";
import { getGuestLikedSet, persistGuestLikedSet } from "../utils/guestLikes";

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const fingerprint = useGuestFingerprint();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await getPostBySlug(slug);
        const fetchedPost = data.post;
        setPost(fetchedPost);
        setLikeCount(fetchedPost.totalLikes ?? 0);

        if (isAuthenticated) {
          setLiked(!!fetchedPost.isLiked);
        } else {
          setLiked(getGuestLikedSet(fingerprint).has(fetchedPost._id));
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          setError("Post not found.");
        } else {
          setError("Something went wrong while loading the post.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, isAuthenticated, fingerprint]);

  const handleLike = useCallback(async () => {
    if (likeLoading || !post) return;

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount((c) => (prevLiked ? c - 1 : c + 1));
    setLikeLoading(true);

    try {
      let response;

      if (isAuthenticated) {
        response = await toggleLike(post._id);
      } else {
        response = await toggleGuestLike(post._id, fingerprint);

        const likedSet = getGuestLikedSet(fingerprint);
        if (response.data.isLiked) {
          likedSet.add(post._id);
        } else {
          likedSet.delete(post._id);
        }
        persistGuestLikedSet(fingerprint, likedSet);
      }

      // Reconcile with server-returned canonical state
      setLiked(response.data.isLiked);
      setLikeCount(response.data.totalLikes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  }, [liked, likeCount, likeLoading, isAuthenticated, post, fingerprint]);

  const handleDelete = useCallback(async () => {
    if (deleteLoading || !post) return;
    setDeleteLoading(true);

    try {
      await deletePost(post._id);
      toast.success("Post deleted successfully.");
      navigate("/", { replace: true });
    } catch {
      toast.error("Something went wrong while deleting the post.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  }, [deleteLoading, post, navigate]);

  const isAuthor = post && user && post.author?._id === user._id;

  if (loading) return <PostDetailSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">{error}</h2>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="py-8 max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
      >
        <HiArrowLeft className="w-4 h-4" />
        All posts
      </Link>

      {/* Post Image */}
      {post.image && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author Info Bar */}
      <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border mb-8">
        <Link
          to={`/profile/${post.author?._id}`}
          className="flex items-center gap-3 group"
        >
          {post.author?.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
              {post.author?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium text-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.author?.name}
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HiOutlineCalendar className="w-4 h-4" />
            <time dateTime={post.createdAt}>{formatDateLong(post.createdAt)}</time>
          </span>
          <span className="flex items-center gap-1.5">
            <HiOutlineClock className="w-4 h-4" />
            {readingTime} min read
          </span>
        </div>
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none text-text leading-relaxed mb-10">
        {post.content.split("\n").map((paragraph, idx) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return <br key={idx} />;
          return (
            <p key={idx} className="mb-4 last:mb-0">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Action Bar: Like + Edit/Delete */}
      <div className="flex items-center justify-between py-4 border-t border-b border-border mb-10">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          aria-label={liked ? "Unlike" : "Like"}
          className="flex items-center gap-2 text-sm transition-colors cursor-pointer group/like disabled:opacity-50"
        >
          {liked ? (
            <HiHeart className="w-6 h-6 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-6 h-6 text-muted-foreground group-hover/like:text-red-500 transition-colors" />
          )}
          <span
            className={`font-medium ${liked ? "text-red-500" : "text-muted-foreground"}`}
          >
            {likeCount} likes
          </span>
        </button>

        {(isAuthor || isAdmin) && (
          <div className="flex items-center gap-2">
            {isAuthor && (
              <Link
                to={`/posts/${post._id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-card border border-border text-text hover:bg-muted transition-colors"
              >
                <HiOutlinePencilAlt className="w-4 h-4" />
                Edit
              </Link>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <CommentSection postId={post._id} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete post"
          message="Are you sure you want to permanently delete this post? This action cannot be undone."
          confirmLabel="Yes, delete"
          icon={HiOutlineTrash}
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </article>
  );
};

/* ─── Loading Skeleton ─── */
const PostDetailSkeleton = () => (
  <div className="py-8 max-w-3xl mx-auto animate-pulse">
    <div className="h-4 w-24 bg-muted rounded mb-6" />
    <div className="aspect-video bg-muted rounded-2xl mb-8" />
    <div className="h-9 w-3/4 bg-muted rounded mb-6" />
    <div className="flex items-center gap-4 pb-6 border-b border-border mb-8">
      <div className="w-11 h-11 rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
    </div>
    <div className="space-y-3 mb-10">
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-5/6 bg-muted rounded" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-2/3 bg-muted rounded" />
    </div>
  </div>
);

export default PostDetailPage;
