import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineExclamation,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  getUserById,
  updateUserRole,
  deleteUser,
} from "../../api/services/adminService";

const ROLE_CONFIG = {
  user: {
    label: "Kullanıcı",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  author: {
    label: "Yazar",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  admin: {
    label: "Admin",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

const STATUS_CONFIG = {
  draft: {
    label: "Taslak",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  pending: {
    label: "İncelemede",
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

const REQUEST_STATUS_CONFIG = {
  pending: {
    label: "Bekliyor",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  approved: {
    label: "Onaylandı",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  rejected: {
    label: "Reddedildi",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getAvatarUrl = (user) =>
  user.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;

/* ═══════════════════════════════════════════════════════════════ */

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSelf = currentUser?._id === id;

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserById(id);
      setData(res.data.data || res.data);
    } catch (err) {
      setError(err.message || "Kullanıcı bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRoleChange = useCallback(
    async (newRole) => {
      if (isSelf) return;
      setRoleLoading(true);
      try {
        await updateUserRole(id, newRole);
        toast.success("Kullanıcı rolü güncellendi.");
        fetchUser();
      } catch (err) {
        toast.error(err.message || "Rol güncellenemedi.");
      } finally {
        setRoleLoading(false);
      }
    },
    [id, isSelf, fetchUser]
  );

  const handleDelete = useCallback(async () => {
    if (isSelf) return;
    if (
      !window.confirm(
        "Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      )
    )
      return;

    setDeleteLoading(true);
    try {
      await deleteUser(id);
      toast.success("Kullanıcı silindi.");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.message || "Kullanıcı silinemedi.");
      setDeleteLoading(false);
    }
  }, [id, isSelf, navigate]);

  /* ── Loading ──────────────────────────────────────────── */

  if (loading) return <DetailSkeleton />;

  /* ── Error ────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <HiOutlineExclamation className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">
            Bir hata oluştu
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const user = data?.user || data;
  const stats = data?.stats || {};
  const authorRequests = data?.authorRequests || user?.authorRequests || [];
  const posts = data?.posts || user?.posts || [];

  if (!user) return null;

  const availableRoles = ["user", "author", "admin"].filter(
    (r) => r !== user.role
  );

  /* ── Main render ──────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <BackButton />

      {/* User Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <img
            src={getAvatarUrl(user)}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-border shrink-0"
          />

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-text">{user.name}</h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    (ROLE_CONFIG[user.role] || ROLE_CONFIG.user).className
                  }`}
                >
                  {(ROLE_CONFIG[user.role] || ROLE_CONFIG.user).label}
                </span>
                {isSelf && (
                  <span className="text-xs text-muted-foreground italic">
                    (Siz)
                  </span>
                )}
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HiOutlineMail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCalendar className="w-4 h-4" />
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={HiOutlineCheckCircle}
          label="Yayınlanan Yazılar"
          value={stats.publishedPosts ?? 0}
          color="text-green-600 dark:text-green-400"
          bg="bg-green-50 dark:bg-green-900/30"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Bekleyen Yazılar"
          value={stats.pendingPosts ?? 0}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatCard
          icon={HiOutlineChatAlt2}
          label="Yorumlar"
          value={stats.totalComments ?? stats.comments ?? 0}
          color="text-teal-600 dark:text-teal-400"
          bg="bg-teal-50 dark:bg-teal-900/30"
        />
        <StatCard
          icon={HiOutlineDocumentText}
          label="Toplam Yazılar"
          value={stats.totalPosts ?? posts.length ?? 0}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-900/30"
        />
      </div>

      {/* Role Change Section */}
      {!isSelf && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-base font-semibold text-text mb-1 flex items-center gap-2">
            <HiOutlineShieldCheck className="w-5 h-5 text-muted-foreground" />
            Rol Değiştir
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kullanıcının mevcut rolü:{" "}
            <strong>{(ROLE_CONFIG[user.role] || ROLE_CONFIG.user).label}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                disabled={roleLoading}
                className="px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-text rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {roleLoading ? "Güncelleniyor..." : `${ROLE_CONFIG[role].label} Yap`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Author Request History */}
      {authorRequests.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text flex items-center gap-2">
              <HiOutlinePencilAlt className="w-5 h-5 text-muted-foreground" />
              Yazar Başvuru Geçmişi
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {authorRequests.map((req) => {
              const statusCfg =
                REQUEST_STATUS_CONFIG[req.status] ||
                REQUEST_STATUS_CONFIG.pending;
              return (
                <li key={req._id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-sm text-text">{req.message}</p>
                  )}
                  {req.rejectionReason && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Ret sebebi: {req.rejectionReason}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* User's Posts */}
      {posts.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text flex items-center gap-2">
              <HiOutlineDocumentText className="w-5 h-5 text-muted-foreground" />
              Kullanıcının Yazıları
              <span className="text-xs font-normal text-muted-foreground">
                ({posts.length})
              </span>
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {posts.map((post) => {
              const statusCfg =
                STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
              return (
                <li key={post._id}>
                  <div className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Danger Zone */}
      {!isSelf && (
        <div className="bg-card border border-red-200 dark:border-red-900/50 rounded-xl p-5">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">
            Tehlikeli Bölge
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bu kullanıcıyı sildiğinizde tüm verileri kalıcı olarak
            kaldırılacaktır. Bu işlem geri alınamaz.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <HiOutlineTrash className="w-4 h-4" />
            {deleteLoading ? "Siliniyor..." : "Kullanıcıyı Sil"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Sub-components                                                */
/* ═══════════════════════════════════════════════════════════════ */

const BackButton = () => (
  <Link
    to="/admin/users"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-text transition-colors"
  >
    <HiOutlineArrowLeft className="w-4 h-4" />
    Kullanıcılara Dön
  </Link>
);

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
    <div
      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-4 w-32 bg-muted rounded" />

    {/* Profile Card */}
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="flex gap-5">
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-4 w-28 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-7 w-10 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded mt-1.5" />
          </div>
        </div>
      ))}
    </div>

    {/* Role Change */}
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="h-5 w-28 bg-muted rounded" />
      <div className="h-4 w-52 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-muted rounded-lg" />
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>
    </div>

    {/* Posts */}
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="h-5 w-36 bg-muted rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0"
        >
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default AdminUserDetailPage;
