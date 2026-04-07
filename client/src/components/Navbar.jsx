import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, canCreatePost, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
        : "text-muted-foreground hover:text-text hover:bg-muted"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-primary-600 dark:text-primary-400 tracking-tight"
          >
            BlogMERN
          </Link>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Ana Sayfa
            </NavLink>
            {canCreatePost && (
              <NavLink to="/posts/new" className={navLinkClass}>
                Yeni Yazı
              </NavLink>
            )}
          </div>

          {/* Right: Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-text transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-text max-w-[120px] truncate">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                    <Link
                      to={`/profile/${user?._id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                    >
                      Profilim
                    </Link>
                    {canCreatePost && (
                      <Link
                        to="/posts/mine"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                      >
                        Yazılarım
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                    >
                      Ayarlar
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-text hover:bg-muted transition-colors"
                      >
                        Admin Paneli
                      </Link>
                    )}
                    <hr className="my-2 border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors cursor-pointer"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-text hover:bg-muted transition-colors cursor-pointer"
            aria-label="Menüyü aç/kapat"
          >
            {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/" end className={navLinkClass} onClick={closeMobileMenu}>
              Ana Sayfa
            </NavLink>
            {canCreatePost && (
              <NavLink to="/posts/new" className={navLinkClass} onClick={closeMobileMenu}>
                Yeni Yazı
              </NavLink>
            )}

            {!isAuthenticated ? (
              <div className="pt-3 space-y-2 border-t border-border mt-3">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-text transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm font-medium text-center text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            ) : (
              <div className="pt-3 space-y-1 border-t border-border mt-3">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-base font-semibold text-primary-700 dark:text-primary-300">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-text">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to={`/profile/${user?._id}`}
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-text hover:bg-muted rounded-lg transition-colors"
                >
                  Profilim
                </Link>
                {canCreatePost && (
                  <Link
                    to="/posts/mine"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-sm text-text hover:bg-muted rounded-lg transition-colors"
                  >
                    Yazılarım
                  </Link>
                )}
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 text-sm text-text hover:bg-muted rounded-lg transition-colors"
                >
                  Ayarlar
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-sm text-text hover:bg-muted rounded-lg transition-colors"
                  >
                    Admin Paneli
                  </Link>
                )}
                <hr className="my-2 border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
