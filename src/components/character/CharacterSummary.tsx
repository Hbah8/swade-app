import { useCharacterStore, validateCharacter } from '@/store/characterStore';
import { cn } from '@/lib/utils';
import { Shield, Footprints, Swords } from 'lucide-react';

export function CharacterSummary() {
  const character = useCharacterStore((s) => s.character);
  const errors = validateCharacter(character);

  const remainAttr = character.creation.attributePoints - character.creation.spentAttributePoints;
  const remainSkill = character.creation.skillPoints - character.creation.spentSkillPoints;

  return (
    <div className="space-y-4 p-4 bg-swade-surface rounded-xl border border-swade-surface-light">
      {/* Name & Concept */}
      <div>
        <h3 className="text-xl font-bold text-swade-gold">
          {character.name || 'Unnamed Character'}
        </h3>
        {character.concept && (
          <p className="text-sm text-swade-text-muted">{character.concept}</p>
        )}
        <div className="flex gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-swade-surface-light rounded-full text-swade-text-muted">
            {character.race}
          </span>
          <span className="text-xs px-2 py-0.5 bg-swade-surface-light rounded-full text-swade-text-muted">
            {character.rank}
          </span>
        </div>
      </div>

      {/* Derived Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          icon={<Footprints size={16} />}
          label="Pace"
          value={character.derivedStats.pace}
        />
        <StatBox
          icon={<Shield size={16} />}
          label="Parry"
          value={character.derivedStats.parry}
        />
        <StatBox
          icon={<Swords size={16} />}
          label="Toughness"
          value={character.derivedStats.toughness}
        />
      </div>

      {/* Points remaining */}
      <div className="grid grid-cols-2 gap-2">
        <PointsBar label="Attribute pts" remaining={remainAttr} total={character.creation.attributePoints} />
        <PointsBar label="Skill pts" remaining={remainSkill} total={character.creation.skillPoints} />
      </div>

      {/* Hindrance pts */}
      {character.creation.hindrancePoints > 0 && (
        <div className="text-xs text-swade-gold-light">
          Hindrance bonus points: {character.creation.hindrancePoints}
        </div>
      )}

      {/* Validation */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div
              key={i}
              className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-300 border border-red-900/50"
            >
              ⚠ {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center p-3 bg-swade-bg rounded-lg">
      <div className="text-swade-gold mb-1">{icon}</div>
      <div className="text-lg font-bold text-swade-text">{value}</div>
      <div className="text-[10px] text-swade-text-muted">{label}</div>
    </div>
  );
}

function PointsBar({
  label,
  remaining,
  total,
}: {
  label: string;
  remaining: number;
  total: number;
}) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  return (
    <div>
      <div className="flex justify-between text-[10px] text-swade-text-muted mb-0.5">
        <span>{label}</span>
        <span>{remaining}/{total}</span>
      </div>
      <div className="h-1.5 bg-swade-bg rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            remaining < 0 ? 'bg-red-500' : remaining === 0 ? 'bg-swade-gold' : 'bg-emerald-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
