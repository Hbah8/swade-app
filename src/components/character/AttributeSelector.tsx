import { useCharacterStore } from '@/store/characterStore';
import type { DieType, AttributeName } from '@/models/character';
import { ATTRIBUTE_NAMES, DIE_ORDER } from '@/models/character';
import { cn } from '@/lib/utils';

const ATTR_DESCRIPTIONS: Record<AttributeName, string> = {
  Agility: 'Nimbleness, reflexes, dexterity',
  Smarts: 'Intellect, education, reasoning',
  Spirit: 'Willpower, inner strength, guts',
  Strength: 'Raw physical power, muscle',
  Vigor: 'Endurance, health, resistance',
};

export function AttributeSelector() {
  const { character, setAttribute } = useCharacterStore();
  const remaining = character.creation.attributePoints - character.creation.spentAttributePoints;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-swade-gold">Attributes</h2>
        <span
          className={cn(
            'text-sm font-mono px-3 py-1 rounded-full',
            remaining < 0
              ? 'bg-red-900/60 text-red-300'
              : remaining === 0
                ? 'bg-swade-gold/20 text-swade-gold'
                : 'bg-emerald-900/40 text-emerald-300',
          )}
        >
          {remaining} / {character.creation.attributePoints} pts
        </span>
      </div>

      <div className="grid gap-3">
        {ATTRIBUTE_NAMES.map((attr) => (
          <div
            key={attr}
            className="flex items-center gap-4 p-3 bg-swade-surface rounded-lg border border-swade-surface-light"
          >
            <div className="w-28">
              <div className="font-semibold text-swade-text">{attr}</div>
              <div className="text-xs text-swade-text-muted">
                {ATTR_DESCRIPTIONS[attr]}
              </div>
            </div>

            <div className="flex gap-1 flex-1">
              {DIE_ORDER.map((die) => (
                <button
                  key={die}
                  onClick={() => setAttribute(attr, die as DieType)}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-mono transition-all',
                    character.attributes[attr] === die
                      ? 'bg-swade-gold text-swade-bg shadow-lg scale-105'
                      : 'bg-swade-surface-light text-swade-text-muted hover:bg-swade-surface-light/70 hover:text-swade-text',
                  )}
                >
                  {die}
                </button>
              ))}
            </div>

            <div className="text-lg font-mono text-swade-gold-light w-10 text-center">
              {character.attributes[attr]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
