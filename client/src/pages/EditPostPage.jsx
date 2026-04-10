import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { getMyPostById, updatePost } from "../api/services/postService";
import { uploadImage } from "../api/services/uploadService";
import { TITLE_MAX, TAGS_MAX } from "../utils/constants";

const EditPostPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getMyPostById(id);
        const postData = data.post || data.data || data;
        setPost(postData);
        setTitle(postData.title || "");
        setContent(postData.content || "");
        setTags(postData.tags || []);
        setImageUrl(postData.image || "");
        setImagePreview(postData.image || "");
      } catch (err) {
        setError(err.message || "Could not load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const isOwner = post?.author?._id === user?._id || post?.author === user?._id;
  const willRevertToDraft =
    (post?.status === "published" && !isAdmin) || post?.status === "pending";

  const handleImageSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setImagePreview(preview);

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Could not upload image.");
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setImagePreview(imageUrl);
    } finally {
      setUploading(false);
    }
  }, [imageUrl]);

  const removeImage = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImagePreview("");
    setImageUrl("");
  }, []);

  const handleAddTag = useCallback(
    (e) => {
      if (e.key !== "Enter" && e.key !== ",") return;
      e.preventDefault();

      const raw = tagInput.trim().toLowerCase();
      if (!raw) return;

      const newTags = raw
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t && !tags.includes(t));

      const available = TAGS_MAX - tags.length;
      if (available <= 0) {
        toast.error(`You can add up to ${TAGS_MAX} tags.`);
        setTagInput("");
        return;
      }

      setTags((prev) => [...prev, ...newTags.slice(0, available)]);
      setTagInput("");
    },
    [tagInput, tags]
  );

  const removeTag = useCallback((tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  const handleSave = async (shouldSubmit = false) => {
    if (!title.trim()) return toast.error("Title is required.");
    if (!content.trim()) return toast.error("Content is required.");

    setSubmitting(true);
    try {
      await updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        image: imageUrl,
        tags,
        submit: shouldSubmit && !isAdmin,
      });

      if (shouldSubmit && !isAdmin) {
        toast.success("Post sent for review.");
      } else if (shouldSubmit && isAdmin) {
        toast.success("Post updated and published.");
      } else {
        toast.success("Draft saved.");
      }

      navigate("/posts/mine");
    } catch (err) {
      toast.error(err.message || "Could not save post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 max-w-3xl mx-auto space-y-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-text mb-1">Post not found</h2>
        <p className="text-sm text-muted-foreground">{error || "You do not have access to this post."}</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-text mb-1">Unauthorized</h2>
        <p className="text-sm text-muted-foreground">You do not have permission to edit this post.</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text">Edit post</h1>
        <p className="text-muted-foreground">
          Update your post and submit again.
        </p>
      </div>

      {/* Status Banners */}
      {post.status === "rejected" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <HiOutlineExclamation className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              This post was rejected. You can edit it and submit again.
            </p>
            {post.rejectionReason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Reason: {post.rejectionReason}
              </p>
            )}
          </div>
        </div>
      )}

      {post.status === "pending" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <HiOutlineClock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This post is under review. If you edit it, it will revert to draft and you will need to submit it again.
          </p>
        </div>
      )}

      {post.status === "published" && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            {isAdmin
              ? "This post is live. As an admin, your edits apply immediately."
              : "This post is live. If you edit it, it will revert to draft and you must submit it for review again."}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-text">
              Title
            </label>
            <span
              className={`text-xs ${
                title.length > TITLE_MAX ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Give your post a title..."
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-text">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={12}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-y min-h-[200px]"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Cover image</label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <HiOutlineX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary-400 hover:bg-muted/50 transition-colors">
              <HiOutlinePhotograph className="w-10 h-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload an image
              </span>
              <span className="text-xs text-muted-foreground/60">
                JPEG, PNG, or WebP — Max. 5 MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="tags" className="text-sm font-medium text-text">
              Tags
            </label>
            <span className="text-xs text-muted-foreground">
              {tags.length}/{TAGS_MAX}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-lg"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="p-0.5 hover:text-primary-900 dark:hover:text-primary-100 cursor-pointer"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter"
            disabled={tags.length >= TAGS_MAX}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Status Change Warning */}
        {willRevertToDraft && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Saving will set this post back to draft. You will need to submit it for review again to publish it.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={!title.trim() || !content.trim() || uploading || submitting}
            className="px-5 py-2.5 border border-border text-text hover:bg-muted font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={!title.trim() || !content.trim() || uploading || submitting}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? "Submitting..."
              : isAdmin
              ? "Update and publish"
              : "Submit for review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;
