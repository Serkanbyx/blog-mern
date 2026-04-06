import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadImage } from "../../api/services/uploadService";
import toast from "react-hot-toast";
import { FiCamera, FiSave, FiUser } from "react-icons/fi";

const BIO_MAX = 200;
const NAME_MIN = 2;
const NAME_MAX = 50;

const SettingsProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen geçerli bir resim dosyası seçin.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu en fazla 5MB olabilir.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < NAME_MIN || trimmedName.length > NAME_MAX) {
      toast.error(`İsim ${NAME_MIN}-${NAME_MAX} karakter arasında olmalıdır.`);
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl = user?.avatar || "";

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }

      await updateUser({
        name: trimmedName,
        bio: bio.trim(),
        avatar: avatarUrl,
      });

      setAvatarFile(null);
      toast.success("Profil başarıyla güncellendi.");
    } catch (error) {
      toast.error(error.message || "Profil güncellenemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormDirty =
    name.trim() !== (user?.name || "") ||
    bio.trim() !== (user?.bio || "") ||
    avatarFile !== null;

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-1">Profil Ayarları</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Adınızı, biyografinizi ve avatar resminizi güncelleyin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={name}
                className="h-20 w-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <FiUser className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Avatar değiştir"
            >
              <FiCamera className="h-5 w-5 text-white" />
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
            >
              Fotoğraf Yükle
            </button>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG veya GIF. Maks 5MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
            İsim
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={NAME_MIN}
            maxLength={NAME_MAX}
            required
            placeholder="Adınız"
            className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {name.trim().length}/{NAME_MAX} karakter
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-text mb-1.5">
            Biyografi
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            maxLength={BIO_MAX}
            rows={3}
            placeholder="Kendinizden kısaca bahsedin..."
            className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Profilinizde görünecek kısa açıklama.</span>
            <span className={bio.length >= BIO_MAX ? "text-red-500 font-medium" : ""}>
              {bio.length}/{BIO_MAX}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || !isFormDirty}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsProfilePage;
