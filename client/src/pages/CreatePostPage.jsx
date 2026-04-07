import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineInformationCircle,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { createPost, submitPost } from "../api/services/postService";
import { uploadImage } from "../api/services/uploadService";
import { TITLE_MAX, TAGS_MAX } from "../utils/constants";

const CreatePostPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      toast.success("Görsel yüklendi.");
    } catch (err) {
      toast.error(err.message || "Görsel yüklenemedi.");
      setImagePreview("");
      setImageUrl("");
    } finally {
      setUploading(false);
    }
  }, []);

  const removeImage = useCallback(() => {
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
        toast.error(`En fazla ${TAGS_MAX} etiket ekleyebilirsiniz.`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Başlık zorunludur.");
    if (!content.trim()) return toast.error("İçerik zorunludur.");

    setSubmitting(true);
    try {
      const { data } = await createPost({
        title: title.trim(),
        content: content.trim(),
        image: imageUrl,
        tags,
      });

      if (!isAdmin) {
        const postId = data.post?._id || data._id;
        await submitPost(postId);
      }

      toast.success(
        isAdmin
          ? "Yazı yayınlandı!"
          : "Yazı incelemeye gönderildi."
      );
      navigate("/posts/mine");
    } catch (err) {
      toast.error(err.message || "Yazı oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim() && content.trim() && !uploading;

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text">Yeni Yazı Oluştur</h1>
        <p className="text-muted-foreground">
          Yazınızı oluşturun ve yayına gönderin.
        </p>
      </div>

      {/* Role Banner */}
      {isAdmin ? (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <HiOutlineShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Admin olarak yazılarınız doğrudan yayınlanır.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Yazınız yayınlanmadan önce admin onayına gönderilecektir.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-text">
              Başlık
            </label>
            <span
              className={`text-xs ${
                title.length > TITLE_MAX
                  ? "text-red-500"
                  : "text-muted-foreground"
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
            placeholder="Yazınıza bir başlık verin..."
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-text">
            İçerik
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Yazınızın içeriğini buraya yazın..."
            rows={12}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors resize-y min-h-[200px]"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">
            Kapak Görseli
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Önizleme"
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
                Görsel yüklemek için tıklayın
              </span>
              <span className="text-xs text-muted-foreground/60">
                JPEG, PNG veya WebP — Maks. 5 MB
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
              Etiketler
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
                    aria-label={`${tag} etiketini kaldır`}
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
            placeholder="Etiket yazın ve Enter'a basın (virgülle ayırarak da ekleyebilirsiniz)"
            disabled={tags.length >= TAGS_MAX}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? "Gönderiliyor..."
              : isAdmin
              ? "Yayınla"
              : "İncelemeye Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
