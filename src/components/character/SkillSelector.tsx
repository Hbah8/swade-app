import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { SKILL_DEFINITIONS, createSkillFromDefinition } from '@/data/skills';

import { cn, dieToIndex } from '@/lib/utils';
import { Plus, Minus, X } from 'lucide-react';

export function SkillSelector() {
  const { character, addSkill, removeSkill, raiseSkill, lowerSkill } = useCharacterStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const remaining = character.creation.skillPoints - character.creation.spentSkillPoints;

  // Skills the character doesn't have yet
  const availableSkills = SKILL_DEFINITIONS.filter(
    (def) => !character.skills.some((s) => s.name === def.name),
  );

  const handleAddSkill = (skillName: string) => {
    const def = SKILL_DEFINITIONS.find((s) => s.name === skillName);
    if (!def) return;
    addSkill(createSkillFromDefinition(def));
    setShowAddMenu(false);
  };

  // Sort: core skills first, then alphabetical
  const sortedSkills = [...character.skills].sort((a, b) => {
    if (a.isCore !== b.isCore) return a.isCore ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-swade-gold">Skills</h2>
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
          {remaining} / {character.creation.skillPoints} pts
        </span>
      </div>

      {/* Skill list */}
      <div className="space-y-2">
        {sortedSkills.map((skill) => {
          const attrDie = character.attributes[skill.linkedAttribute];
          const isAboveAttr = dieToIndex(skill.die) > dieToIndex(attrDie);
          const isAtMin = skill.die === 'd4';
          const isAtMax = skill.die === 'd12';

          return (
            <div
              key={skill.id}
              className="flex items-center gap-3 p-2 bg-swade-surface rounded-lg border border-swade-surface-light"
            >
              {/* Name & attribute */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-swade-text truncate">
                    {skill.name}
                  </span>
                  {skill.isCore && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-swade-gold/20 text-swade-gold rounded-full">
                      CORE
                    </span>
                  )}
                </div>
                <div className="text-xs text-swade-text-muted">
                  {skill.linkedAttribute} ({attrDie})
                  {isAboveAttr && (
                    <span className="text-amber-400 ml-1">• costs 2pt/step</span>
                  )}
                </div>
              </div>

              {/* Die controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => lowerSkill(skill.id)}
                  disabled={isAtMin}
                  className={cn(
                    'p-1 rounded transition-colors',
                    isAtMin
                      ? 'text-swade-text-muted/30 cursor-not-allowed'
                      : 'text-swade-text-muted hover:text-swade-accent hover:bg-swade-accent/10',
                  )}
                >
                  <Minus size={14} />
                </button>

                <span className="w-10 text-center font-mono text-sm text-swade-gold-light">
                  {skill.die}
                </span>

                <button
                  onClick={() => raiseSkill(skill.id)}
                  disabled={isAtMax}
                  className={cn(
                    'p-1 rounded transition-colors',
                    isAtMax
                      ? 'text-swade-text-muted/30 cursor-not-allowed'
                      : 'text-swade-text-muted hover:text-emerald-400 hover:bg-emerald-900/20',
                  )}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Remove (non-core only) */}
              {!skill.isCore && (
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="p-1 text-swade-text-muted hover:text-swade-accent transition-colors"
                  title="Remove skill"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add skill button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-2 border border-dashed border-swade-surface-light rounded-lg text-sm text-swade-text-muted hover:text-swade-gold hover:border-swade-gold/50 transition-colors"
        >
          + Add Skill
        </button>

        {showAddMenu && (
          <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-swade-surface border border-swade-surface-light rounded-lg shadow-xl">
            {availableSkills.map((def) => (
              <button
                key={def.name}
                onClick={() => handleAddSkill(def.name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-swade-surface-light transition-colors"
              >
                <span className="text-swade-text">{def.name}</span>
                <span className="text-swade-text-muted ml-2 text-xs">
                  ({def.linkedAttribute})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
