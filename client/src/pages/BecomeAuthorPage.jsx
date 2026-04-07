import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  submitAuthorRequest,
  getMyAuthorRequest,
  cancelAuthorRequest,
} from "../api/services/authorRequestService";
import toast from "react-hot-toast";
import {
  FiEdit3,
  FiUsers,
  FiTrendingUp,
  FiSend,
  FiClock,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiBookOpen,
} from "react-icons/fi";

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

const BENEFITS = [
  {
    icon: FiEdit3,
    title: "Blog Yazıları Yayınla",
    description: "Kendi blog yazılarınızı oluşturun ve geniş bir kitleyle paylaşın.",
  },
  {
    icon: FiUsers,
    title: "Kitlenizi Büyütün",
    description: "Yazılarınızla okuyucu kitlesi oluşturun ve topluluğa katkı sağlayın.",
  },
  {
    icon: FiTrendingUp,
    title: "Bilginizi Paylaşın",
    description: "Uzmanlık alanınızdaki bilgi ve deneyimlerinizi diğerleriyle paylaşın.",
  },
];

const BecomeAuthorPage = () => {
  const navigate = useNavigate();
  const { user, isAuthor, isAdmin } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | no-request | pending | rejected
  const [existingRequest, setExistingRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isAuthor || isAdmin) {
      toast("Zaten yazar/yönetici yetkiniz var.", { icon: "✅" });
      navigate("/", { replace: true });
    }
  }, [isAuthor, isAdmin, navigate]);

  const fetchRequestStatus = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await getMyAuthorRequest();
      const request = data.data;

      if (!request) {
        setStatus("no-request");
        setExistingRequest(null);
        return;
      }

      setExistingRequest(request);
      setStatus(request.status === "pending" ? "pending" : "rejected");
    } catch (error) {
      if (error.status === 404) {
        setStatus("no-request");
        setExistingRequest(null);
      } else {
        toast.error("Başvuru durumu alınamadı.");
        setStatus("no-request");
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthor && !isAdmin) {
      fetchRequestStatus();
    }
  }, [fetchRequestStatus, isAuthor, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (trimmed.length < MESSAGE_MIN || trimmed.length > MESSAGE_MAX) {
      toast.error(`Mesaj ${MESSAGE_MIN}-${MESSAGE_MAX} karakter arasında olmalıdır.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await submitAuthorRequest({ message: trimmed });
      setExistingRequest(data.data);
      setStatus("pending");
      setMessage("");
      toast.success("Başvurunuz başarıyla gönderildi!");
    } catch (error) {
      toast.error(error.message || "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelAuthorRequest();
      setExistingRequest(null);
      setStatus("no-request");
      toast.success("Başvurunuz iptal edildi.");
    } catch (error) {
      toast.error(error.message || "Başvuru iptal edilemedi.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = () => {
    setExistingRequest(null);
    setStatus("no-request");
    setMessage("");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
          <FiBookOpen className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-text">Yazar Ol</h1>
        <p className="mt-2 text-muted-foreground">
          Bilginizi paylaşın, blog yazıları yayınlayın, kitlenizi oluşturun.
        </p>
      </div>

      {/* State 1: No Request — Show Benefits + Form */}
      {status === "no-request" && (
        <>
          {/* Benefits */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          {/* Application Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground">
              Başvuru Formu
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Neden yazar olmak istediğinizi bize anlatın.
            </p>

            <form onSubmit={handleSubmit} className="mt-5">
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-card-foreground"
                >
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  minLength={MESSAGE_MIN}
                  maxLength={MESSAGE_MAX}
                  placeholder="Neden yazar olmak istiyorsunuz? Hangi konularda yazı yazmayı planlıyorsunuz?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {message.trim().length < MESSAGE_MIN
                      ? `En az ${MESSAGE_MIN} karakter gerekli`
                      : "Harika görünüyor!"}
                  </span>
                  <span
                    className={
                      message.length > MESSAGE_MAX
                        ? "text-red-500 font-medium"
                        : ""
                    }
                  >
                    {message.length}/{MESSAGE_MAX}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || message.trim().length < MESSAGE_MIN}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiSend className="h-4 w-4" />
                    Başvuru Gönder
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}

      {/* State 2: Pending Request */}
      {status === "pending" && existingRequest && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/50 dark:bg-amber-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <FiClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                Başvurunuz İnceleniyor
              </h2>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/80">
                Başvurunuz bir yönetici tarafından incelenmektedir. İşlem
                tamamlandığında bilgilendirileceksiniz.
              </p>

              {/* Submitted message */}
              <div className="mt-4 rounded-lg border border-amber-200 bg-white/60 p-4 dark:border-amber-800/30 dark:bg-amber-900/20">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Gönderilen Mesaj
                </p>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                  {existingRequest.message}
                </p>
              </div>

              {/* Submitted date */}
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                Gönderim tarihi:{" "}
                {new Date(existingRequest.createdAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {/* Cancel button */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-5 flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                {isCancelling ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                    İptal ediliyor...
                  </>
                ) : (
                  <>
                    <FiXCircle className="h-4 w-4" />
                    Başvuruyu İptal Et
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Rejected Request */}
      {status === "rejected" && existingRequest && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/50 dark:bg-red-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                  Başvurunuz Onaylanmadı
                </h2>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400/80">
                  Önceki başvurunuz onaylanmadı. Yeni bir başvuru gönderebilirsiniz.
                </p>

                {/* Rejection reason */}
                {existingRequest.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white/60 p-4 dark:border-red-800/30 dark:bg-red-900/20">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Red Nedeni
                    </p>
                    <p className="mt-1 text-sm text-red-900 dark:text-red-200">
                      {existingRequest.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Rejected date */}
                <p className="mt-3 text-xs text-red-600 dark:text-red-500">
                  Red tarihi:{" "}
                  {new Date(existingRequest.updatedAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Retry button */}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Yeni Başvuru Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      {status === "no-request" && (
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Başvurunuz bir yönetici tarafından incelenecektir. Süreç genellikle 1-2
          iş günü içinde tamamlanır.
        </p>
      )}
    </div>
  );
};

export default BecomeAuthorPage;
