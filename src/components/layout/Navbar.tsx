import { NavLink } from 'react-router-dom';
import { BookOpen, UserPlus, Home, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShopStore } from '@/store/shopStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/character', label: 'Character Builder', icon: UserPlus },
  { to: '/rules', label: 'Rules Reference', icon: BookOpen },
  { to: '/catalog', label: 'Catalog', icon: Store },
  { to: '/shops', label: 'Shop Manager', icon: Store },
] as const;

export function Navbar() {
  const { campaign, setActiveSetting } = useShopStore();

  return (
    <nav className="bg-swade-surface border-b border-swade-surface-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="text-xl font-bold text-swade-gold">
              SWADE App
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            <Select value={campaign.activeSettingId} onValueChange={setActiveSetting}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Setting" />
              </SelectTrigger>
              <SelectContent>
                {campaign.settings.map((setting) => (
                  <SelectItem key={setting.id} value={setting.id}>
                    {setting.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
      </div>
    </nav>
  );
}
