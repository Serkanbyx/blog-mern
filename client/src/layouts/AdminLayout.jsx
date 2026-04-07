import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlinePencilAlt,
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
  HiMenu,
} from "react-icons/hi";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: HiOutlineChartBar, end: true },
  { to: "/admin/users", label: "Kullanıcılar", icon: HiOutlineUsers },
  { to: "/admin/author-requests", label: "Yazar Başvuruları", icon: HiOutlinePencilAlt },
  { to: "/admin/posts", label: "Yazılar", icon: HiOutlineDocumentText },
  { to: "/admin/comments", label: "Yorumlar", icon: HiOutlineChatAlt2 },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
        : "text-muted-foreground hover:text-text hover:bg-muted"
    }`;

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-border">
        <h2 className="text-lg font-bold text-text">Admin Panel</h2>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map(({ to, label, icon, end }) => {
          const Icon = icon;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-text hover:bg-muted transition-colors"
        >
          <HiOutlineArrowLeft size={20} />
          Siteye Dön
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-border bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border bg-card/80 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-text hover:bg-muted transition-colors cursor-pointer"
            aria-label="Menüyü aç"
          >
            <HiMenu size={22} />
          </button>
          <h2 className="text-base font-bold text-text">Admin Panel</h2>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
