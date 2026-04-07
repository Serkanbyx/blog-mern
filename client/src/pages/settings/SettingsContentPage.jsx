import { usePreferences } from "../../context/PreferencesContext";
import toast from "react-hot-toast";
import { FiCheck } from "react-icons/fi";

const POSTS_PER_PAGE_OPTIONS = [5, 10, 20, 30, 50];

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni", description: "Yayınlanma tarihine göre en yeniler önce" },
  { value: "popular", label: "En Popüler", description: "Beğeni sayısına göre en çok beğenilenler önce" },
  { value: "mostCommented", label: "En Çok Yorumlanan", description: "Yorum sayısına göre en çok tartışılanlar önce" },
];

const SettingsContentPage = () => {
  const { postsPerPage, defaultSort, updatePreference } = usePreferences();

  const handleChange = async (key, value) => {
    try {
      await updatePreference(key, value);
    } catch {
      toast.error("Ayar kaydedilemedi.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Posts Per Page */}
      <section>
        <h2 className="text-xl font-bold text-text mb-1">İçerik Ayarları</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ana sayfadaki içerik görünümünü özelleştirin.
        </p>

        <div>
          <h3 className="text-lg font-semibold text-text mb-1">Sayfa Başına Yazı</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ana sayfada sayfa başına gösterilecek yazı sayısı.
          </p>

          <div className="flex flex-wrap gap-2">
            {POSTS_PER_PAGE_OPTIONS.map((count) => {
              const isActive = postsPerPage === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleChange("postsPerPage", count)}
                  className={`min-w-14 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-text hover:bg-muted/80"
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Default Sort */}
      <section>
        <h3 className="text-lg font-semibold text-text mb-1">Varsayılan Sıralama</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ana sayfayı açtığınızda varsayılan sıralama düzeni.
        </p>

        <div className="space-y-2">
          {SORT_OPTIONS.map(({ value, label, description }) => {
            const isActive = defaultSort === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("defaultSort", value)}
                className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-border bg-bg hover:border-primary-300"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 ${
                    isActive
                      ? "border-primary-600 bg-primary-600"
                      : "border-muted-foreground"
                  }`}
                >
                  {isActive && <FiCheck className="h-3 w-3 text-white" />}
                </span>
                <div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-primary-600" : "text-text"
                    }`}
                  >
                    {label}
                  </span>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SettingsContentPage;
