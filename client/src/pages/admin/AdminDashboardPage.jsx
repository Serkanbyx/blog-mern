import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlinePencilAlt,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineArrowRight,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { getDashboardStats } from "../../api/services/adminService";

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Toplam Kullanıcı",
    icon: HiOutlineUsers,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    key: "totalAuthors",
    label: "Toplam Yazar",
    icon: HiOutlineUserGroup,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/30",
  },
  {
    key: "publishedPosts",
    label: "Yayınlanan Yazılar",
    icon: HiOutlineCheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/30",
  },
  {
    key: "pendingPosts",
    label: "Bekleyen Yazılar",
    icon: HiOutlineClock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    linkTo: "/admin/posts/pending",
  },
  {
    key: "rejectedPosts",
    label: "Reddedilen Yazılar",
    icon: HiOutlineXCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
  },
  {
    key: "totalComments",
    label: "Toplam Yorum",
    icon: HiOutlineChatAlt2,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/30",
  },
  {
    key: "pendingAuthorRequests",
    label: "Bekleyen Başvurular",
    icon: HiOutlinePencilAlt,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    linkTo: "/admin/author-requests",
  },
];

const ROLE_BADGES = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  author: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  reader: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400",
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch (err) {
        setError(err.message || "İstatistikler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">Bir hata oluştu</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sitenizin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Pending Alerts */}
      {(stats.pendingPosts > 0 || stats.pendingAuthorRequests > 0) && (
        <div className="space-y-3">
          {stats.pendingPosts > 0 && (
            <AlertBanner
              message={`${stats.pendingPosts} yazı onay bekliyor.`}
              linkTo="/admin/posts/pending"
              linkLabel="İncele"
              color="amber"
            />
          )}
          {stats.pendingAuthorRequests > 0 && (
            <AlertBanner
              message={`${stats.pendingAuthorRequests} yazar başvurusu onay bekliyor.`}
              linkTo="/admin/author-requests"
              linkLabel="İncele"
              color="purple"
            />
          )}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, linkTo }) => {
          const CardWrapper = linkTo ? Link : "div";
          const wrapperProps = linkTo
            ? { to: linkTo, className: "group" }
            : {};

          return (
            <CardWrapper key={key} {...wrapperProps}>
              <div
                className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
                  linkTo ? "hover:border-primary-500/50 cursor-pointer" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{stats[key]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Recent Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <DashboardCard
          title="Son Kullanıcılar"
          linkTo="/admin/users"
          linkLabel="Tümünü Gör"
          isEmpty={stats.recentUsers.length === 0}
          emptyText="Henüz kullanıcı yok."
        >
          <ul className="divide-y divide-border">
            {stats.recentUsers.map((user) => (
              <li key={user._id}>
                <Link
                  to={`/admin/users/${user._id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        ROLE_BADGES[user.role] || ROLE_BADGES.reader
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Pending Posts */}
        <DashboardCard
          title="Bekleyen Yazılar"
          linkTo="/admin/posts/pending"
          linkLabel="Tümünü Gör"
          isEmpty={stats.recentPendingPosts.length === 0}
          emptyText="Onay bekleyen yazı yok."
        >
          <ul className="divide-y divide-border">
            {stats.recentPendingPosts.map((post) => (
              <li key={post._id}>
                <Link
                  to="/admin/posts/pending"
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {post.author?.name || "Bilinmeyen Yazar"}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDate(post.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Pending Author Requests */}
        <DashboardCard
          title="Bekleyen Başvurular"
          linkTo="/admin/author-requests"
          linkLabel="Tümünü Gör"
          isEmpty={stats.recentAuthorRequests.length === 0}
          emptyText="Bekleyen başvuru yok."
        >
          <ul className="divide-y divide-border">
            {stats.recentAuthorRequests.map((req) => (
              <li key={req._id}>
                <Link
                  to="/admin/author-requests"
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">
                      {req.user?.name || "Bilinmeyen Kullanıcı"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.messagePreview}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDate(req.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
};

/* ─── Sub Components ─────────────────────────────────────────── */

const AlertBanner = ({ message, linkTo, linkLabel, color }) => {
  const colorMap = {
    amber:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300",
  };

  const btnColorMap = {
    amber:
      "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white",
    purple:
      "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white",
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${colorMap[color]}`}
    >
      <div className="flex items-center gap-2">
        <HiOutlineExclamation className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Link
        to={linkTo}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${btnColorMap[color]}`}
      >
        {linkLabel}
      </Link>
    </div>
  );
};

const DashboardCard = ({ title, linkTo, linkLabel, isEmpty, emptyText, children }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {linkLabel}
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
    {isEmpty ? (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        {emptyText}
      </div>
    ) : (
      children
    )}
  </div>
);

/* ─── Skeleton ───────────────────────────────────────────────── */

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="h-4 w-72 bg-muted rounded mt-2" />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div>
            <div className="h-7 w-12 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded mt-1.5" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboardPage;
