import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineDotsVertical,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineExclamation,
  HiOutlineUsers,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../../api/services/adminService";
import Pagination from "../../components/Pagination";
import RoleBadge, { ROLE_CONFIG } from "../../components/ui/RoleBadge";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/formatDate";
import { getAvatarUrl } from "../../utils/helpers";

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Tüm Roller" },
  { value: "user", label: "Kullanıcı" },
  { value: "author", label: "Yazar" },
  { value: "admin", label: "Admin" },
];

/* ═══════════════════════════════════════════════════════════════ */

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: null,
    userName: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdown]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;

      const { data } = await getAllUsers(params);
      const result = data.data || data;
      setUsers(result.users || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err.message || "Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRoleFilterChange = useCallback((e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      setOpenDropdown(null);
      setActionLoading(userId);
      try {
        await updateUserRole(userId, newRole);
        toast.success("Kullanıcı rolü güncellendi.");
        fetchUsers();
      } catch (err) {
        toast.error(err.message || "Rol güncellenemedi.");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchUsers]
  );

  const openDeleteConfirm = useCallback((userId, userName) => {
    setOpenDropdown(null);
    setDeleteModal({ open: true, userId, userName });
  }, []);

  const handleDelete = useCallback(async () => {
    const { userId } = deleteModal;
    setActionLoading(userId);
    try {
      await deleteUser(userId);
      toast.success("Kullanıcı silindi.");
      setDeleteModal({ open: false, userId: null, userName: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Kullanıcı silinemedi.");
    } finally {
      setActionLoading(null);
    }
  }, [deleteModal, fetchUsers]);

  const isSelf = useCallback(
    (userId) => currentUser?._id === userId,
    [currentUser]
  );

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <HiOutlineExclamation className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">
          Bir hata oluştu
        </h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Kullanıcılar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tüm kullanıcıları yönetin, rolleri değiştirin veya hesapları silin.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="İsim veya e-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={handleRoleFilterChange}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors cursor-pointer"
        >
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          icon={HiOutlineUsers}
          title="Kullanıcı Bulunamadı"
          message={
            debouncedSearch || roleFilter
              ? "Arama kriterlerinize uygun kullanıcı bulunamadı."
              : "Henüz kayıtlı kullanıcı yok."
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Kullanıcı
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    E-posta
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Rol
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                    Katılım
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={getAvatarUrl(user)}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                        />
                        <span className="text-sm font-medium text-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate max-w-[180px]">
                          {user.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionsDropdown
                        user={user}
                        isSelf={isSelf(user._id)}
                        isLoading={actionLoading === user._id}
                        isOpen={openDropdown === user._id}
                        onToggle={() =>
                          setOpenDropdown(
                            openDropdown === user._id ? null : user._id
                          )
                        }
                        onRoleChange={handleRoleChange}
                        onDelete={() => openDeleteConfirm(user._id, user.name)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                isSelf={isSelf(user._id)}
                isLoading={actionLoading === user._id}
                isOpen={openDropdown === user._id}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === user._id ? null : user._id
                  )
                }
                onRoleChange={handleRoleChange}
                onDelete={() => openDeleteConfirm(user._id, user.name)}
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

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <ConfirmModal
          title="Kullanıcıyı Sil"
          message={`"${deleteModal.userName}" adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmLabel="Evet, Sil"
          icon={HiOutlineTrash}
          variant="danger"
          loading={actionLoading === deleteModal.userId}
          onConfirm={handleDelete}
          onCancel={() =>
            setDeleteModal({ open: false, userId: null, userName: "" })
          }
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const ActionsDropdown = ({
  user,
  isSelf,
  isLoading,
  isOpen,
  onToggle,
  onRoleChange,
  onDelete,
}) => {
  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground italic px-2">Siz</span>
    );
  }

  const availableRoles = ["user", "author", "admin"].filter(
    (r) => r !== user.role
  );

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        disabled={isLoading}
        className="p-2 rounded-lg text-muted-foreground hover:text-text hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
        aria-label="İşlemler"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiOutlineDotsVertical className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-30 py-1">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(user._id, role)}
              className="w-full text-left px-4 py-2 text-sm text-text hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
            >
              <HiOutlineShieldCheck className="w-4 h-4 text-muted-foreground" />
              {ROLE_CONFIG[role].label} yap
            </button>
          ))}

          <div className="border-t border-border my-1" />

          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-2"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Kullanıcıyı Sil
          </button>
        </div>
      )}
    </div>
  );
};

const UserCard = ({
  user,
  isSelf,
  isLoading,
  isOpen,
  onToggle,
  onRoleChange,
  onDelete,
}) => (
  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <Link
        to={`/admin/users/${user._id}`}
        className="flex items-center gap-3 group min-w-0"
      >
        <img
          src={getAvatarUrl(user)}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-border shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </Link>

      <ActionsDropdown
        user={user}
        isSelf={isSelf}
        isLoading={isLoading}
        isOpen={isOpen}
        onToggle={onToggle}
        onRoleChange={onRoleChange}
        onDelete={onDelete}
      />
    </div>

    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <RoleBadge role={user.role} />
      <span>Katılım: {formatDate(user.createdAt)}</span>
    </div>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const UsersSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-4 py-3 flex gap-4">
        {[120, 160, 60, 80, 60].map((w, i) => (
          <div key={i} className="h-4 bg-muted rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
        >
          <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg ml-auto" />
        </div>
      ))}
    </div>

    <div className="md:hidden space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-3 w-40 bg-muted rounded" />
            </div>
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminUsersPage;
