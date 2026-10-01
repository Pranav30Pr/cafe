import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './SvgIcon';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Skip link for keyboard accessibility (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-cafe-accent focus:text-white focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-cafe-surface border-b border-cafe-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand mark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-cafe-accent font-semibold text-lg hover:text-cafe-accentHover transition-colors duration-150 focus-visible:outline-none"
            aria-label="Artisan Roast Cafe, Home"
          >
            <span className="w-8 h-8 rounded bg-cafe-accent text-white flex items-center justify-center font-bold text-base" aria-hidden="true">
              A
            </span>
            <span className="tracking-tight">Artisan Roast Cafe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`touch-target px-3.5 py-2 rounded text-sm font-medium transition-colors duration-150 flex items-center ${
                    active
                      ? 'bg-cafe-muted text-cafe-accent font-semibold'
                      : 'text-cafe-text hover:bg-cafe-muted hover:text-cafe-accent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Table QR Demo / Staff */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/t/tbl_tok_demo_table_01"
              className="touch-target px-3 py-1.5 text-xs font-medium text-cafe-accent border border-cafe-border hover:bg-cafe-muted rounded transition-colors duration-150 flex items-center gap-1.5"
              title="Test QR table ordering simulation"
            >
              <Icons.QrCode className="w-3.5 h-3.5 text-cafe-accent" />
              <span>Table 1 QR View</span>
            </Link>
            <Link
              to="/kitchen"
              className="touch-target px-3 py-1.5 text-xs font-medium text-cafe-textMuted hover:text-cafe-text transition-colors duration-150 flex items-center"
            >
              Staff Portal
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2 rounded text-cafe-text hover:bg-cafe-muted transition-colors duration-150 flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden border-t border-cafe-border bg-cafe-surface px-4 py-3 space-y-1"
            aria-label="Mobile Navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`touch-target block px-3 py-2.5 rounded text-base font-medium flex items-center ${
                    active
                      ? 'bg-cafe-muted text-cafe-accent font-semibold'
                      : 'text-cafe-text hover:bg-cafe-muted'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-cafe-border mt-2 flex flex-col gap-1">
              <Link
                to="/t/tbl_tok_demo_table_01"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target px-3 py-2.5 rounded text-sm text-cafe-accent font-medium bg-cafe-muted flex items-center gap-2"
              >
                <Icons.QrCode className="w-4 h-4" />
                <span>Simulate Table 1 QR Order</span>
              </Link>
              <Link
                to="/kitchen"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target px-3 py-2.5 rounded text-sm text-cafe-textMuted hover:text-cafe-text flex items-center"
              >
                Staff Portal (Kitchen / Admin)
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};
