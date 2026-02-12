import { Link } from 'react-router-dom';
import { UserPlus, BookOpen, Dice5 } from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <div className="text-6xl">🎲</div>
        <h1 className="text-4xl md:text-5xl font-bold text-swade-gold">
          SWADE App
        </h1>
        <p className="text-lg text-swade-text-muted max-w-md mx-auto">
          Character generator &amp; interactive rules reference for
          <span className="text-swade-gold-light font-semibold"> Savage Worlds Adventure Edition</span>
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <FeatureCard
          to="/character"
          icon={<UserPlus size={32} />}
          title="Character Builder"
          description="Create characters step-by-step following SWADE rules. Export to PDF or JSON."
        />
        <FeatureCard
          to="/rules"
          icon={<BookOpen size={32} />}
          title="Rules Reference"
          description="Interactive guide to combat, traits, edges, and more. Search and explore."
        />
      </div>

      {/* Quick info */}
      <div className="flex flex-wrap justify-center gap-6 text-xs text-swade-text-muted pt-4">
        <div className="flex items-center gap-1.5">
          <Dice5 size={14} className="text-swade-gold" />
          <span>Based on SWADE core rules</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>💾</span>
          <span>Auto-saves to browser</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📄</span>
          <span>PDF &amp; JSON export</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-3 p-6 bg-swade-surface border border-swade-surface-light rounded-xl hover:border-swade-gold/30 transition-all hover:shadow-lg hover:shadow-swade-gold/5"
    >
      <div className="text-swade-gold group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-swade-text group-hover:text-swade-gold-light">
        {title}
      </h2>
      <p className="text-sm text-swade-text-muted">{description}</p>
    </Link>
  );
}
