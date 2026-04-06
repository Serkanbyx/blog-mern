import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineDocumentText,
  HiChevronDown,
} from "react-icons/hi";

const settingsLinks = [
  { to: "/settings", label: "Profil", icon: HiOutlineUser, end: true },
  { to: "/settings/account", label: "Hesap", icon: HiOutlineCog },
  { to: "/settings/appearance", label: "Görünüm", icon: HiOutlineColorSwatch },
  { to: "/settings/privacy", label: "Gizlilik", icon: HiOutlineShieldCheck },
  { to: "/settings/notifications", label: "Bildirimler", icon: HiOutlineBell },
  { to: "/settings/content", label: "İçerik", icon: HiOutlineDocumentText },
];

const SettingsLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
        : "text-muted-foreground hover:text-text hover:bg-muted"
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
      <h1 className="text-2xl font-bold text-text mb-6">Ayarlar</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile: Dropdown Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-text cursor-pointer"
          >
            Menü
            <HiChevronDown
              size={18}
              className={`transition-transform ${mobileNavOpen ? "rotate-180" : ""}`}
            />
          </button>
          {mobileNavOpen && (
            <nav className="mt-2 bg-card border border-border rounded-xl p-2 space-y-1">
              {settingsLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={linkClass}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        {/* Desktop: Side Navigation */}
        <aside className="hidden lg:block lg:w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {settingsLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
