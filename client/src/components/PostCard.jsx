import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { HiHeart, HiOutlineHeart, HiOutlineChatAlt } from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import useGuestFingerprint from "../hooks/useGuestFingerprint";
import { toggleLike, toggleGuestLike } from "../api/services/likeService";
import { formatDate } from "../utils/formatDate";
import { truncateContent } from "../utils/helpers";
import { getGuestLikedSet, persistGuestLikedSet } from "../utils/guestLikes";

const PostCard = ({ post, onLikeUpdate }) => {
  const { isAuthenticated } = useAuth();
  const fingerprint = useGuestFingerprint();

  const resolveInitialLiked = () => {
    if (isAuthenticated) return !!post.isLiked;
    return getGuestLikedSet(fingerprint).has(post._id);
  };

  const [liked, setLiked] = useState(resolveInitialLiked);
  const [likeCount, setLikeCount] = useState(post.totalLikes ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (likeLoading) return;

      const prevLiked = liked;
      const prevCount = likeCount;

      // Optimistic update
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

        onLikeUpdate?.(post._id, response.data.isLiked);
      } catch {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      } finally {
        setLikeLoading(false);
      }
    },
    [liked, likeCount, likeLoading, isAuthenticated, post._id, fingerprint, onLikeUpdate]
  );

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Post Image */}
      <Link to={`/posts/${post.slug}`} className="block aspect-video overflow-hidden bg-muted">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
            <span className="text-4xl text-primary-400 dark:text-primary-600 select-none">
              ✎
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-3">
        {/* Author + Date */}
        <div className="flex items-center gap-2.5">
          <Link
            to={`/profile/${post.author?._id}`}
            className="shrink-0"
          >
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300">
                {post.author?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex flex-col min-w-0">
            <Link
              to={`/profile/${post.author?._id}`}
              className="text-sm font-medium text-text hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors"
            >
              {post.author?.name}
            </Link>
            <time className="text-xs text-muted-foreground" dateTime={post.createdAt}>
              {formatDate(post.createdAt)}
            </time>
          </div>
        </div>

        {/* Title */}
        <Link to={`/posts/${post.slug}`}>
          <h2 className="text-lg font-semibold text-text leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Content Preview */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {truncateContent(post.content)}
        </p>

        {/* Footer: Likes & Comments */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            aria-label={liked ? "Remove like" : "Like"}
            className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer group/like disabled:opacity-50"
          >
            {liked ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5 text-muted-foreground group-hover/like:text-red-500 transition-colors" />
            )}
            <span className={liked ? "text-red-500 font-medium" : "text-muted-foreground"}>
              {likeCount}
            </span>
          </button>

          <Link
            to={`/posts/${post.slug}#comments`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <HiOutlineChatAlt className="w-5 h-5" />
            <span>{post.commentsCount ?? 0}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
