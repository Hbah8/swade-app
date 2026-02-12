import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { HINDRANCE_DEFINITIONS, createHindrance } from '@/data/hindrances';
import type { HindranceSeverity } from '@/models/character';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function HindrancePicker() {
  const { character, addHindrance, removeHindrance } = useCharacterStore();
  const [showPicker, setShowPicker] = useState(false);

  const majors = character.hindrances.filter((h) => h.severity === 'Major');
  const minors = character.hindrances.filter((h) => h.severity === 'Minor');
  const canAddMajor = majors.length < 1;
  const canAddMinor = minors.length < 2;
  const totalPoints = character.creation.hindrancePoints;

  const handleAdd = (name: string, severity: HindranceSeverity) => {
    const h = createHindrance(name, severity);
    if (h) addHindrance(h);
  };

  // Filter out already-taken hindrances
  const availableHindrances = HINDRANCE_DEFINITIONS.filter(
    (def) => !character.hindrances.some((h) => h.name === def.name),
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-swade-gold">Hindrances</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-swade-text-muted">
            {totalPoints} / 4 pts
          </span>
          <div className="flex gap-1.5">
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full',
              canAddMajor ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300',
            )}>
              Major: {majors.length}/1
            </span>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full',
              canAddMinor ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300',
            )}>
              Minor: {minors.length}/2
            </span>
          </div>
        </div>
      </div>

      {/* Current hindrances */}
      {character.hindrances.length > 0 && (
        <div className="space-y-2">
          {character.hindrances.map((h) => (
            <div
              key={h.id}
              className="flex items-start gap-3 p-3 bg-swade-surface rounded-lg border border-swade-accent/20"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-swade-text">{h.name}</span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    h.severity === 'Major' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300',
                  )}>
                    {h.severity}
                  </span>
                </div>
                <p className="text-xs text-swade-text-muted mt-1">{h.effect}</p>
              </div>
              <button
                onClick={() => removeHindrance(h.id)}
                className="p-1 text-swade-text-muted hover:text-swade-accent transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Spending guide */}
      {totalPoints > 0 && (
        <div className="p-3 bg-swade-gold/10 border border-swade-gold/20 rounded-lg text-xs text-swade-gold-light">
          <strong>Hindrance Points ({totalPoints}):</strong>
          <ul className="mt-1 space-y-0.5 list-disc list-inside text-swade-text-muted">
            <li>2 pts = +1 Attribute die or +1 Edge</li>
            <li>1 pt = +1 Skill point or +$1000 starting funds</li>
          </ul>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full py-2 border border-dashed border-swade-surface-light rounded-lg text-sm text-swade-text-muted hover:text-swade-gold hover:border-swade-gold/50 transition-colors"
      >
        {showPicker ? '− Close' : '+ Add Hindrance'}
      </button>

      {/* Picker */}
      {showPicker && (
        <div className="max-h-72 overflow-y-auto bg-swade-surface border border-swade-surface-light rounded-lg divide-y divide-swade-surface-light">
          {availableHindrances.map((def) => (
            <div key={def.name} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="text-sm font-medium text-swade-text">{def.name}</span>
                  <p className="text-xs text-swade-text-muted mt-0.5">{def.description}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {def.availableSeverities.includes('Minor') && (
                    <button
                      onClick={() => handleAdd(def.name, 'Minor')}
                      disabled={!canAddMinor}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded transition-colors',
                        canAddMinor
                          ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                          : 'bg-swade-surface-light text-swade-text-muted/30 cursor-not-allowed',
                      )}
                    >
                      Minor
                    </button>
                  )}
                  {def.availableSeverities.includes('Major') && (
                    <button
                      onClick={() => handleAdd(def.name, 'Major')}
                      disabled={!canAddMajor}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded transition-colors',
                        canAddMajor
                          ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60'
                          : 'bg-swade-surface-light text-swade-text-muted/30 cursor-not-allowed',
                      )}
                    >
                      Major
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
