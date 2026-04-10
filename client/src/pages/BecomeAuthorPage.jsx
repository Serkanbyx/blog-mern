import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  submitAuthorRequest,
  getMyAuthorRequest,
  cancelAuthorRequest,
} from "../api/services/authorRequestService";
import toast from "react-hot-toast";
import { formatDateLong } from "../utils/formatDate";
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
    title: "Publish blog posts",
    description: "Create your own posts and share them with a wide audience.",
  },
  {
    icon: FiUsers,
    title: "Grow your audience",
    description: "Build a readership with your writing and contribute to the community.",
  },
  {
    icon: FiTrendingUp,
    title: "Share your expertise",
    description: "Share knowledge and experience from your field with others.",
  },
];

const BecomeAuthorPage = () => {
  const navigate = useNavigate();
  const { isAuthor, isAdmin } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | no-request | pending | rejected
  const [existingRequest, setExistingRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isAuthor || isAdmin) {
      toast("You already have author or admin access.", { icon: "✅" });
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
        toast.error("Could not load application status.");
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
      toast.error(`Message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await submitAuthorRequest({ message: trimmed });
      setExistingRequest(data.data);
      setStatus("pending");
      setMessage("");
      toast.success("Your application was submitted successfully!");
    } catch (error) {
      toast.error(error.message || "Could not submit application. Please try again.");
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
      toast.success("Your application was cancelled.");
    } catch (error) {
      toast.error(error.message || "Could not cancel application.");
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
        <h1 className="text-3xl font-bold text-text">Become an author</h1>
        <p className="mt-2 text-muted-foreground">
          Share your knowledge, publish posts, and grow your audience.
        </p>
      </div>

      {/* State 1: No Request — Show Benefits + Form */}
      {status === "no-request" && (
        <>
          {/* Benefits */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
                >
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Application Form */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-card-foreground">
              Application form
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us why you want to become an author.
            </p>

            <form onSubmit={handleSubmit} className="mt-5">
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-card-foreground"
                >
                  Your message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  minLength={MESSAGE_MIN}
                  maxLength={MESSAGE_MAX}
                  placeholder="Why do you want to be an author? What topics do you plan to write about?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-lg border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {message.trim().length < MESSAGE_MIN
                      ? `At least ${MESSAGE_MIN} characters required`
                      : "Looks great!"}
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
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="h-4 w-4" />
                    Submit application
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
                Your application is under review
              </h2>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/80">
                An administrator is reviewing your application. You will be
                notified when the process is complete.
              </p>

              {/* Submitted message */}
              <div className="mt-4 rounded-lg border border-amber-200 bg-white/60 p-4 dark:border-amber-800/30 dark:bg-amber-900/20">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Submitted message
                </p>
                <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                  {existingRequest.message}
                </p>
              </div>

              {/* Submitted date */}
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                Submitted on:{" "}
                {formatDateLong(existingRequest.createdAt)}
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
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FiXCircle className="h-4 w-4" />
                    Cancel application
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
                  Your application was not approved
                </h2>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400/80">
                  Your previous application was not approved. You may submit a new one.
                </p>

                {/* Rejection reason */}
                {existingRequest.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white/60 p-4 dark:border-red-800/30 dark:bg-red-900/20">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Reason for rejection
                    </p>
                    <p className="mt-1 text-sm text-red-900 dark:text-red-200">
                      {existingRequest.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Rejected date */}
                <p className="mt-3 text-xs text-red-600 dark:text-red-500">
                  Rejected on:{" "}
                  {formatDateLong(existingRequest.updatedAt)}
                </p>

                {/* Retry button */}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2"
                >
                  <FiRefreshCw className="h-4 w-4" />
                  Submit new application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      {status === "no-request" && (
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Your application will be reviewed by an administrator. The process
          usually completes within 1–2 business days.
        </p>
      )}
    </div>
  );
};

export default BecomeAuthorPage;
