import { useState, useMemo } from 'react';
import { RULES_DATA } from '@/data/rules';
import { RULE_CATEGORIES } from '@/models/rules';
import type { RuleSection, RuleCategory } from '@/models/rules';
import { cn } from '@/lib/utils';
import { Search, ChevronRight } from 'lucide-react';

export function RuleExplorer() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<RuleCategory | 'All'>('All');
  const [selectedRule, setSelectedRule] = useState<RuleSection | null>(null);

  const filtered = useMemo(() => {
    return RULES_DATA.filter((rule) => {
      const matchesCategory = activeCategory === 'All' || rule.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        rule.title.toLowerCase().includes(q) ||
        rule.content.toLowerCase().includes(q) ||
        rule.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-swade-text-muted" />
          <input
            type="text"
            placeholder="Search rules... (e.g. 'shaken', 'wild card')"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-swade-surface border border-swade-surface-light rounded-lg text-sm text-swade-text placeholder-swade-text-muted/50 focus:border-swade-gold/50 focus:outline-none focus:ring-1 focus:ring-swade-gold/30"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          <CategoryPill
            label="All"
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
          />
          {RULE_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Rule list */}
        <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-sm text-swade-text-muted py-4 text-center">
              No rules found — try a different search.
            </p>
          )}
          {filtered.map((rule) => (
            <button
              key={rule.id}
              onClick={() => setSelectedRule(rule)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-all group',
                selectedRule?.id === rule.id
                  ? 'bg-swade-gold/15 border border-swade-gold/30'
                  : 'bg-swade-surface hover:bg-swade-surface-light border border-transparent',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-swade-text group-hover:text-swade-gold-light">
                  {rule.title}
                </h3>
                <ChevronRight size={14} className="text-swade-text-muted" />
              </div>
              <span className="text-[10px] text-swade-text-muted">{rule.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Panel */}
      <div className="lg:col-span-8 bg-swade-surface rounded-xl border border-swade-surface-light p-6 overflow-y-auto max-h-[75vh]">
        {selectedRule ? (
          <RuleContent rule={selectedRule} onNavigate={setSelectedRule} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-swade-text-muted gap-2">
            <Search size={40} className="opacity-30" />
            <p className="text-sm">Select a rule from the sidebar to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function RuleContent({
  rule,
  onNavigate,
}: {
  rule: RuleSection;
  onNavigate: (rule: RuleSection) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-swade-gold">{rule.title}</h2>
        <span className="inline-block px-2 py-0.5 bg-swade-gold/10 text-swade-gold-light text-xs rounded mt-1">
          {rule.category}
        </span>
      </div>

      {/* Content — rendered as formatted text */}
      <div className="prose prose-invert prose-sm max-w-none text-swade-text leading-relaxed">
        {rule.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <h3 key={i} className="text-swade-gold-light font-bold mt-4 mb-1">
                {line.replace(/\*\*/g, '')}
              </h3>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={i} className="ml-4 list-disc text-swade-text-muted">
                <RichText text={line.slice(2)} />
              </li>
            );
          }
          if (line.startsWith('|')) {
            return (
              <code key={i} className="block text-xs text-swade-text-muted font-mono">
                {line}
              </code>
            );
          }
          if (line.trim() === '') return <br key={i} />;
          return (
            <p key={i} className="text-swade-text-muted">
              <RichText text={line} />
            </p>
          );
        })}
      </div>

      {/* Examples */}
      {rule.examples?.map((ex, i) => (
        <div
          key={i}
          className="p-4 bg-swade-bg rounded-lg border-l-4 border-swade-gold"
        >
          <h4 className="font-bold text-swade-gold-light text-sm">📖 {ex.title}</h4>
          <p className="text-xs text-swade-text-muted mt-1">{ex.description}</p>
          {ex.steps && (
            <ol className="list-decimal list-inside mt-2 space-y-0.5 text-xs text-swade-text-muted">
              {ex.steps.map((step, j) => (
                <li key={j}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      ))}

      {/* Related rules */}
      {rule.relatedRules.length > 0 && (
        <div>
          <h4 className="text-xs text-swade-text-muted mb-2">Related rules:</h4>
          <div className="flex flex-wrap gap-2">
            {rule.relatedRules.map((id) => {
              const related = RULES_DATA.find((r) => r.id === id);
              return related ? (
                <button
                  key={id}
                  onClick={() => onNavigate(related)}
                  className="px-3 py-1 bg-swade-surface-light hover:bg-swade-surface-light/70 rounded text-xs text-swade-gold-light transition-colors"
                >
                  {related.title} →
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-swade-surface-light">
        {rule.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 bg-swade-surface-light text-swade-text-muted rounded"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Simple bold text renderer for **text** patterns */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-swade-text font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
        active
          ? 'bg-swade-gold text-swade-bg'
          : 'bg-swade-surface-light text-swade-text-muted hover:text-swade-text',
      )}
    >
      {label}
    </button>
  );
}
