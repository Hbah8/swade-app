import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateFirstShopCardProps {
  newLocationName: string;
  onNewLocationNameChange: (value: string) => void;
  onCreateLocation: () => void;
}

export function CreateFirstShopCard({
  newLocationName,
  onNewLocationNameChange,
  onCreateLocation,
}: CreateFirstShopCardProps) {
  return (
    <section className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
      <h2 className="text-sm font-semibold text-swade-gold-light">Create first shop</h2>
      <div className="flex gap-2">
        <Input
          value={newLocationName}
          onChange={(event) => onNewLocationNameChange(event.target.value)}
          placeholder="Location name"
        />
        <Button type="button" onClick={onCreateLocation}>
          Add
        </Button>
      </div>
    </section>
  );
}
