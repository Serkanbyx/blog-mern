import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  HiOutlinePencil,
  HiOutlineCog,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineHeart,
  HiOutlineChatAlt,
  HiOutlineCamera,
  HiOutlineArrowRight,
  HiOutlineLockClosed,
} from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import { getUserProfile, getUserLikedPosts } from "../api/services/userService";
import { getAllPosts } from "../api/services/postService";
import { getUserComments } from "../api/services/commentService";
import { uploadImage } from "../api/services/uploadService";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/ui/PostCardSkeleton";
import RoleBadge from "../components/ui/RoleBadge";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { formatJoinDate, formatDate } from "../utils/formatDate";
import { COMMENTS_PER_PAGE } from "../utils/constants";

const POSTS_PER_PAGE = 9;

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [commentCount, setCommentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("posts");

  // Posts tab state
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);

  // Liked posts tab state
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedPage, setLikedPage] = useState(1);
  const [likedTotalPages, setLikedTotalPages] = useState(1);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedPrivate, setLikedPrivate] = useState(false);

  // Comments tab state
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPrivate, setCommentsPrivate] = useState(false);

  // Avatar upload state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isOwner = useMemo(
    () => isAuthenticated && currentUser?._id === userId,
    [isAuthenticated, currentUser, userId]
  );

  const privacy = useMemo(() => profile?.preferences?.privacy ?? {}, [profile]);
  const showLikedPosts = useMemo(
    () => privacy.showLikedPosts !== false || isOwner,
    [privacy.showLikedPosts, isOwner]
  );
  const showComments = useMemo(
    () => privacy.showComments !== false || isOwner,
    [privacy.showComments, isOwner]
  );

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getUserProfile(userId);
        setProfile(data.user);
        setPostCount(data.postCount);
        setCommentCount(data.commentCount);

        const isAuthorRole = data.user.role === "author" || data.user.role === "admin";
        setActiveTab(isAuthorRole && data.postCount > 0 ? "posts" : "posts");
      } catch {
        setError("User not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Fetch posts when Posts tab is active
  useEffect(() => {
    if (activeTab !== "posts") return;

    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const { data } = await getAllPosts({
          author: userId,
          page: postsPage,
          limit: POSTS_PER_PAGE,
          sort: "newest",
        });
        setPosts(data.posts);
        setPostsTotalPages(data.totalPages);
      } catch {
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [activeTab, userId, postsPage]);

  // Fetch liked posts when Liked Posts tab is active
  useEffect(() => {
    if (activeTab !== "liked") return;

    const fetchLikedPosts = async () => {
      setLikedLoading(true);
      setLikedPrivate(false);
      try {
        const { data } = await getUserLikedPosts(userId, {
          page: likedPage,
          limit: POSTS_PER_PAGE,
        });
        setLikedPosts(data.posts);
        setLikedTotalPages(data.totalPages);
      } catch (err) {
        if (err.response?.status === 403) {
          setLikedPrivate(true);
        }
        setLikedPosts([]);
      } finally {
        setLikedLoading(false);
      }
    };

    fetchLikedPosts();
  }, [activeTab, userId, likedPage]);

  // Fetch comments when Comments tab is active
  useEffect(() => {
    if (activeTab !== "comments") return;

    const fetchUserComments = async () => {
      setCommentsLoading(true);
      setCommentsPrivate(false);
      try {
        const { data } = await getUserComments(userId, {
          page: commentsPage,
          limit: COMMENTS_PER_PAGE,
        });
        setComments(data.comments);
        setCommentsTotalPages(data.totalPages);
      } catch (err) {
        if (err.response?.status === 403) {
          setCommentsPrivate(true);
        }
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchUserComments();
  }, [activeTab, userId, commentsPage]);

  const handleAvatarUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be under 2MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }

      setAvatarUploading(true);
      try {
        const { url: avatarUrl, publicId: avatarPublicId } = await uploadImage(file);
        await updateUser({ avatar: avatarUrl, avatarPublicId });
        setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
        setShowAvatarModal(false);
        toast.success("Profile photo updated.");
      } catch {
        toast.error("Something went wrong while uploading the photo.");
      } finally {
        setAvatarUploading(false);
      }
    },
    [updateUser]
  );

  const handlePageChange = useCallback(
    (tab) => (newPage) => {
      if (tab === "posts") setPostsPage(newPage);
      else if (tab === "liked") setLikedPage(newPage);
      else if (tab === "comments") setCommentsPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  // Build available tabs
  const tabs = useMemo(() => {
    const tabList = [];

    tabList.push({
      id: "posts",
      label: "Posts",
      icon: HiOutlineDocumentText,
      count: postCount,
    });

    if (showLikedPosts) {
      tabList.push({
        id: "liked",
        label: "Liked",
        icon: HiOutlineHeart,
      });
    }

    if (showComments) {
      tabList.push({
        id: "comments",
        label: "Comments",
        icon: HiOutlineChatAlt,
        count: commentCount,
      });
    }

    return tabList;
  }, [postCount, commentCount, showLikedPosts, showComments]);

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">{error}</h2>
        <Link
          to="/"
          className="text-primary-600 dark:text-primary-400 hover:underline mt-2"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary-600 dark:bg-primary-900 flex items-center justify-center border-2 border-primary-700 dark:border-border">
                <span className="text-4xl font-bold text-white dark:text-primary-300">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {isOwner && (
              <button
                onClick={() => setShowAvatarModal(true)}
                aria-label="Change profile photo"
                className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <HiOutlineCamera className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-text">
                {profile.name}
              </h1>
              <RoleBadge role={profile.role} />
            </div>

            {profile.bio && (
              <p className="text-muted-foreground max-w-lg">{profile.bio}</p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground">
              <HiOutlineCalendar className="w-4 h-4" />
              <span>Member since {formatJoinDate(profile.createdAt)}</span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-5 pt-1">
              <StatItem label="posts" value={postCount} />
              {commentCount !== null && (
                <StatItem label="comments" value={commentCount} />
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                  Edit profile
                </Link>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="inline-flex items-center justify-center w-10 h-10 border border-border rounded-xl text-muted-foreground hover:bg-muted hover:text-text transition-colors"
                >
                  <HiOutlineCog className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA for owner */}
      {isOwner && currentUser?.role === "user" && (
        <Link
          to="/become-author"
          className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-800/40 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
        >
          <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
            Want to write posts? Become an author
          </span>
          <HiOutlineArrowRight className="w-4 h-4 text-primary-700 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {isOwner &&
        (currentUser?.role === "author" || currentUser?.role === "admin") &&
        postCount === 0 && (
          <Link
            to="/posts/new"
            className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-800/40 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
          >
            <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
              Start by writing your first post
            </span>
            <HiOutlineArrowRight className="w-4 h-4 text-primary-700 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px" aria-label="Profile tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                    : "border-transparent text-muted-foreground hover:text-text hover:border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count !== null && (
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-primary-600 text-white dark:bg-primary-900/40 dark:text-primary-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "posts" && (
          <PostsTab
            posts={posts}
            loading={postsLoading}
            page={postsPage}
            totalPages={postsTotalPages}
            onPageChange={handlePageChange("posts")}
          />
        )}

        {activeTab === "liked" && (
          <LikedPostsTab
            posts={likedPosts}
            loading={likedLoading}
            isPrivate={likedPrivate}
            isOwner={isOwner}
            page={likedPage}
            totalPages={likedTotalPages}
            onPageChange={handlePageChange("liked")}
          />
        )}

        {activeTab === "comments" && (
          <CommentsTab
            comments={comments}
            loading={commentsLoading}
            isPrivate={commentsPrivate}
            isOwner={isOwner}
            page={commentsPage}
            totalPages={commentsTotalPages}
            onPageChange={handlePageChange("comments")}
          />
        )}
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <AvatarModal
          onClose={() => setShowAvatarModal(false)}
          onUpload={handleAvatarUpload}
          uploading={avatarUploading}
        />
      )}
    </div>
  );
};

/* ─── Sub-components ─── */

const StatItem = ({ label, value }) => (
  <div className="text-center sm:text-left">
    <span className="text-lg font-bold text-text">{value}</span>
    <span className="ml-1 text-sm text-muted-foreground">{label}</span>
  </div>
);

const PostsTab = ({ posts, loading, page, totalPages, onPageChange }) => {
  if (loading) return <PostCardSkeleton count={6} />;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={HiOutlineDocumentText}
        message="No posts published yet."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

const LikedPostsTab = ({
  posts,
  loading,
  isPrivate,
  isOwner,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isPrivate && !isOwner) {
    return (
      <EmptyState
        icon={HiOutlineLockClosed}
        isPrivate
        message="This content is private."
      />
    );
  }

  if (loading) return <PostCardSkeleton count={6} />;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={HiOutlineHeart}
        message="No liked posts yet."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

const CommentsTab = ({
  comments,
  loading,
  isPrivate,
  isOwner,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isPrivate && !isOwner) {
    return (
      <EmptyState
        icon={HiOutlineLockClosed}
        isPrivate
        message="This content is private."
      />
    );
  }

  if (loading) return <CommentListSkeleton />;

  if (comments.length === 0) {
    return (
      <EmptyState
        icon={HiOutlineChatAlt}
        message="No comments yet."
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-card border border-border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Link
                to={`/posts/${comment.postId?.slug}`}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline line-clamp-1"
              >
                {comment.postId?.title || "Deleted post"}
              </Link>
              <time className="text-xs text-muted-foreground shrink-0 ml-3">
                {formatDate(comment.createdAt)}
              </time>
            </div>
            <p className="text-sm text-text leading-relaxed">{comment.text}</p>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};

const AvatarModal = ({ onClose, onUpload, uploading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold text-text">
        Update profile photo
      </h3>
      <p className="text-sm text-muted-foreground">
        JPG, PNG, or WebP, up to 2MB.
      </p>

      <label
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer transition-colors ${
          uploading
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10"
        }`}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        ) : (
          <>
            <HiOutlineCamera className="w-8 h-8 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">
              Choose a photo or drag and drop
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onUpload}
          disabled={uploading}
        />
      </label>

      <button
        onClick={onClose}
        disabled={uploading}
        className="w-full py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  </div>
);

/* ─── Skeletons ─── */

const ProfileSkeleton = () => (
  <div className="py-8 space-y-8 animate-pulse">
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-28 h-28 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-8 w-48 bg-muted rounded mx-auto sm:mx-0" />
          <div className="h-4 w-64 bg-muted rounded mx-auto sm:mx-0" />
          <div className="h-4 w-40 bg-muted rounded mx-auto sm:mx-0" />
          <div className="flex gap-5 justify-center sm:justify-start">
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
    <div className="h-12 bg-muted rounded-xl" />
    <PostCardSkeleton count={6} />
  </div>
);

const CommentListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-xl p-4 space-y-2 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    ))}
  </div>
);

export default UserProfilePage;
