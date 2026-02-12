import { useCharacterStore } from '@/store/characterStore';
import { AttributeSelector } from '@/components/character/AttributeSelector';
import { SkillSelector } from '@/components/character/SkillSelector';
import { EdgePicker } from '@/components/character/EdgePicker';
import { HindrancePicker } from '@/components/character/HindrancePicker';
import { CharacterSummary } from '@/components/character/CharacterSummary';
import { ExportImportBar } from '@/components/character/ExportImportBar';
import { RACE_DEFINITIONS } from '@/data/races';

export function CharacterBuilderPage() {
  const { character, setName, setConcept, setRace, setNotes } = useCharacterStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-swade-gold">Character Builder</h1>

      {/* Export / Import bar */}
      <ExportImportBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Main inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-swade-text-muted mb-1">Character Name</label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-3 py-2 bg-swade-surface border border-swade-surface-light rounded-lg text-sm text-swade-text placeholder-swade-text-muted/50 focus:border-swade-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-swade-text-muted mb-1">Concept</label>
              <input
                type="text"
                value={character.concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Battle-hardened knight"
                className="w-full px-3 py-2 bg-swade-surface border border-swade-surface-light rounded-lg text-sm text-swade-text placeholder-swade-text-muted/50 focus:border-swade-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-swade-text-muted mb-1">Race</label>
              <select
                value={character.race}
                onChange={(e) => setRace(e.target.value)}
                className="w-full px-3 py-2 bg-swade-surface border border-swade-surface-light rounded-lg text-sm text-swade-text focus:border-swade-gold/50 focus:outline-none"
              >
                {RACE_DEFINITIONS.map((race) => (
                  <option key={race.id} value={race.name}>
                    {race.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Race abilities */}
          {character.race !== 'Human' && (
            <RaceAbilities raceName={character.race} />
          )}

          {/* Attributes */}
          <AttributeSelector />

          {/* Skills */}
          <SkillSelector />

          {/* Hindrances */}
          <HindrancePicker />

          {/* Edges */}
          <EdgePicker />

          {/* Notes */}
          <section>
            <label className="block text-xs text-swade-text-muted mb-1">Notes</label>
            <textarea
              value={character.notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Background, gear, special notes..."
              className="w-full px-3 py-2 bg-swade-surface border border-swade-surface-light rounded-lg text-sm text-swade-text placeholder-swade-text-muted/50 focus:border-swade-gold/50 focus:outline-none resize-y"
            />
          </section>
        </div>

        {/* Right column — Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CharacterSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

function RaceAbilities({ raceName }: { raceName: string }) {
  const race = RACE_DEFINITIONS.find((r) => r.name === raceName);
  if (!race) return null;

  return (
    <div className="p-3 bg-swade-surface rounded-lg border border-swade-gold/20">
      <h3 className="text-sm font-bold text-swade-gold-light mb-2">
        {race.name} — Racial Abilities
      </h3>
      <ul className="space-y-1">
        {race.abilities.map((ab) => (
          <li key={ab.name} className="text-xs text-swade-text-muted">
            <span className="text-swade-text font-medium">{ab.name}:</span> {ab.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
