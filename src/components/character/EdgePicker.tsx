import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { EDGE_DEFINITIONS, createEdge } from '@/data/edges';
import { canTakeEdge, getUnmetRequirements } from '@/services/characterValidator';
import type { EdgeCategory } from '@/models/character';
import { cn } from '@/lib/utils';
import { X, Lock, Unlock } from 'lucide-react';

const EDGE_CATEGORIES: EdgeCategory[] = [
  'Background', 'Combat', 'Leadership', 'Power', 'Professional', 'Social', 'Weird',
];

export function EdgePicker() {
  const { character, addEdge, removeEdge } = useCharacterStore();
  const [showPicker, setShowPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<EdgeCategory | 'All'>('All');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const filteredEdges = EDGE_DEFINITIONS.filter((def) => {
    if (filterCategory !== 'All' && def.category !== filterCategory) return false;
    if (character.edges.some((e) => e.name === def.name)) return false;
    if (showOnlyAvailable) {
      const edge = createEdge(def.name);
      if (!edge || !canTakeEdge(character, edge)) return false;
    }
    return true;
  });

  const handleAddEdge = (name: string) => {
    const edge = createEdge(name);
    if (edge) addEdge(edge);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-swade-gold">Edges</h2>
        <span className="text-sm text-swade-text-muted">
          {character.edges.length} selected
        </span>
      </div>

      {/* Current edges */}
      {character.edges.length > 0 && (
        <div className="space-y-2">
          {character.edges.map((edge) => (
            <div
              key={edge.id}
              className="flex items-start gap-3 p-3 bg-swade-surface rounded-lg border border-swade-gold/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-swade-gold-light">
                    {edge.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-swade-surface-light text-swade-text-muted rounded-full">
                    {edge.category}
                  </span>
                </div>
                <p className="text-xs text-swade-text-muted mt-1">{edge.description}</p>
              </div>
              <button
                onClick={() => removeEdge(edge.id)}
                className="p-1 text-swade-text-muted hover:text-swade-accent transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full py-2 border border-dashed border-swade-surface-light rounded-lg text-sm text-swade-text-muted hover:text-swade-gold hover:border-swade-gold/50 transition-colors"
      >
        {showPicker ? '− Close' : '+ Add Edge'}
      </button>

      {/* Picker */}
      {showPicker && (
        <div className="bg-swade-surface border border-swade-surface-light rounded-lg p-3 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory('All')}
              className={cn(
                'px-2 py-1 rounded-full text-xs transition-colors',
                filterCategory === 'All'
                  ? 'bg-swade-gold text-swade-bg'
                  : 'bg-swade-surface-light text-swade-text-muted hover:text-swade-text',
              )}
            >
              All
            </button>
            {EDGE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  'px-2 py-1 rounded-full text-xs transition-colors',
                  filterCategory === cat
                    ? 'bg-swade-gold text-swade-bg'
                    : 'bg-swade-surface-light text-swade-text-muted hover:text-swade-text',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-swade-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded"
            />
            Show only available edges
          </label>

          {/* Edge list */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredEdges.map((def) => {
              const edge = createEdge(def.name);
              const available = edge ? canTakeEdge(character, edge) : false;
              const unmet = edge ? getUnmetRequirements(character, edge) : [];

              return (
                <button
                  key={def.name}
                  onClick={() => available && handleAddEdge(def.name)}
                  disabled={!available}
                  className={cn(
                    'w-full text-left p-2 rounded-lg text-sm transition-colors',
                    available
                      ? 'hover:bg-swade-surface-light cursor-pointer'
                      : 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {available ? (
                      <Unlock size={12} className="text-emerald-400" />
                    ) : (
                      <Lock size={12} className="text-swade-text-muted" />
                    )}
                    <span className="text-swade-text">{def.name}</span>
                    <span className="text-[10px] text-swade-text-muted">
                      {def.category}
                    </span>
                  </div>
                  <p className="text-xs text-swade-text-muted mt-0.5 ml-5">
                    {def.description}
                  </p>
                  {unmet.length > 0 && (
                    <p className="text-[10px] text-swade-accent mt-0.5 ml-5">
                      Requires: {unmet.join(', ')}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
