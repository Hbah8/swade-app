import { NavLink } from 'react-router-dom';
import { BookOpen, UserPlus, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/character', label: 'Character Builder', icon: UserPlus },
  { to: '/rules', label: 'Rules Reference', icon: BookOpen },
] as const;

export function Navbar() {
  return (
    <nav className="bg-swade-surface border-b border-swade-surface-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="text-xl font-bold text-swade-gold">
              SWADE App
            </span>
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-swade-gold/20 text-swade-gold'
                      : 'text-swade-text-muted hover:text-swade-text hover:bg-swade-surface-light',
                  )
                }
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
