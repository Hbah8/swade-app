import { RuleExplorer } from '@/components/rules/RuleExplorer';

export function RulesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-swade-gold">Rules Reference</h1>
      <p className="text-sm text-swade-text-muted">
        Browse and search the Savage Worlds Adventure Edition rules. Select a category or search for a topic.
      </p>
      <RuleExplorer />
    </div>
  );
}
