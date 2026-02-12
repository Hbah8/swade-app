import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-swade-surface-light py-4 text-center text-xs text-swade-text-muted">
        SWADE App — Fan-made tool for Savage Worlds Adventure Edition
      </footer>
    </div>
  );
}
