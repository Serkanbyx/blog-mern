import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineExclamation,
  HiOutlinePencilAlt,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineMail,
} from "react-icons/hi";
import toast from "react-hot-toast";
import {
  getPendingAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
} from "../../api/services/adminService";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getAvatarUrl = (user) =>
  user?.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=6366f1&color=fff`;

/* ═══════════════════════════════════════════════════════════════ */

const AdminAuthorRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({
    open: false,
    requestId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getPendingAuthorRequests();
      setRequests(data.data || data.requests || []);
    } catch (err) {
      setError(err.message || "Başvurular yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = useCallback(
    async (requestId) => {
      if (!window.confirm("Bu başvuruyu onaylamak istediğinize emin misiniz?"))
        return;

      setActionLoading(requestId);
      try {
        await approveAuthorRequest(requestId);
        toast.success("Kullanıcı yazar olarak terfi ettirildi.");
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      } catch (err) {
        toast.error(err.message || "Başvuru onaylanamadı.");
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const openRejectModal = useCallback((requestId) => {
    setRejectModal({ open: true, requestId });
    setRejectionReason("");
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({ open: false, requestId: null });
    setRejectionReason("");
  }, []);

  const handleReject = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast.error("Ret sebebi zorunludur.");
      return;
    }

    const { requestId } = rejectModal;
    setActionLoading(requestId);
    try {
      await rejectAuthorRequest(requestId, rejectionReason.trim());
      toast.success("Başvuru reddedildi.");
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      closeRejectModal();
    } catch (err) {
      toast.error(err.message || "Başvuru reddedilemedi.");
    } finally {
      setActionLoading(null);
    }
  }, [rejectModal, rejectionReason, closeRejectModal]);

  /* ── Error state ─────────────────────────────────────── */

  if (error && requests.length === 0) {
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

  /* ── Main render ─────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Yazar Başvuruları</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bekleyen yazar başvurularını inceleyin ve onaylayın veya reddedin.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <RequestsSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestCard
              key={req._id}
              request={req}
              isLoading={actionLoading === req._id}
              onApprove={handleApprove}
              onReject={openRejectModal}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <RejectModal
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          isLoading={actionLoading === rejectModal.requestId}
          onConfirm={handleReject}
          onClose={closeRejectModal}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Sub-components                                                */
/* ═══════════════════════════════════════════════════════════════ */

const RequestCard = ({ request, isLoading, onApprove, onReject }) => {
  const user = request.user || {};

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* User Info */}
      <div className="flex items-start gap-4">
        <img
          src={getAvatarUrl(user)}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-border shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text">{user.name}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <HiOutlineMail className="w-3.5 h-3.5" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-3.5 h-3.5" />
              Katılım: {formatDate(user.createdAt)}
            </span>
            {(request.stats || user.stats) && (
              <span className="flex items-center gap-1">
                <HiOutlineChatAlt2 className="w-3.5 h-3.5" />
                {(request.stats || user.stats)?.totalComments ?? 0} yorum
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Motivation Message */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
          Başvuru Mesajı
        </p>
        <p className="text-sm text-text leading-relaxed whitespace-pre-line">
          {request.message || "Mesaj belirtilmemiş."}
        </p>
      </div>

      {/* Request Date */}
      <p className="text-xs text-muted-foreground">
        Başvuru tarihi: {formatDate(request.createdAt)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onApprove(request._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineCheck className="w-4 h-4" />
          Onayla
        </button>
        <button
          onClick={() => onReject(request._id)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <HiOutlineX className="w-4 h-4" />
          Reddet
        </button>
      </div>
    </div>
  );
};

const RejectModal = ({
  rejectionReason,
  setRejectionReason,
  isLoading,
  onConfirm,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text">Başvuruyu Reddet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ret sebebini belirtin. Bu mesaj kullanıcıya iletilecektir.
        </p>
      </div>

      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        placeholder="Ret sebebini yazın..."
        rows={4}
        className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
        autoFocus
      />

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-text transition-colors cursor-pointer disabled:opacity-50"
        >
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || !rejectionReason.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reddediliyor...
            </>
          ) : (
            <>
              <HiOutlineX className="w-4 h-4" />
              Reddet
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
      <HiOutlinePencilAlt className="w-7 h-7 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-text mb-1">
      Bekleyen Başvuru Yok
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Şu anda onay bekleyen yazar başvurusu bulunmuyor.
    </p>
  </div>
);

/* ─── Skeleton ────────────────────────────────────────────── */

const RequestsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-24 bg-muted rounded-lg" />
          <div className="h-9 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export default AdminAuthorRequestsPage;
