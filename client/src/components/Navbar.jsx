import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import Brand from './Brand.jsx';
import CartIcon from './CartIcon.jsx';

export default function Navbar({ user, onLogout, darkMode, setDarkMode }) {
  const { cart } = useContext(AppContext);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const closeProfile = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-950/85">
      <div className="mx-auto flex min-h-[72px] w-[min(1180px,calc(100%-28px))] items-center justify-between gap-4">
        <Link to="/" className="brand shrink-0 transition-opacity duration-200 hover:opacity-75">
          <Brand />
          <span>GreenCart</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {[
            ['/', 'Home'],
            ['/shop', 'Shop'],
            ['/orders', 'Orders'],
            ['/dashboard', 'Dashboard'],
          ].map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `text-sm font-medium transition-colors duration-200 ${isActive ? 'text-stone-950 dark:text-white' : 'text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="grid size-9 place-items-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-white"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setDarkMode((value) => !value)}
          >
            <span aria-hidden="true">{darkMode ? '☼' : '☾'}</span>
          </button>

          <Link to="/cart" className="group relative grid size-9 place-items-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-white" aria-label={`Cart with ${cartCount} items`}>
            <CartIcon />
            {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-stone-900 px-1 py-0.5 text-[10px] font-bold leading-none text-white dark:bg-white dark:text-stone-900">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="grid size-7 place-items-center rounded-full bg-stone-900 text-xs font-bold text-white dark:bg-white dark:text-stone-900">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="hidden max-w-24 truncate text-xs font-semibold text-stone-700 sm:block dark:text-stone-200">{user.name}</span>
                <span className="text-xs text-stone-400" aria-hidden="true">⌄</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10 dark:border-stone-700 dark:bg-stone-900">
                  <Link to="/orders" className="block rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white" onClick={() => setProfileOpen(false)}>My orders</Link>
                  <Link to="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white" onClick={() => setProfileOpen(false)}>Dashboard</Link>
                  <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30" onClick={onLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 sm:flex"><Link to="/login" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">Log in</Link><Link to="/register" className="rounded-lg bg-stone-950 px-3.5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-stone-700 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200">Sign up</Link></div>
          )}
        </div>
      </div>
    </header>
  );
}
