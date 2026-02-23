import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarLocation {
  id: string;
  name: string;
}

interface ShopSidebarProps {
  locationSearch: string;
  newLocationName: string;
  filteredLocations: SidebarLocation[];
  resolvedActiveLocationId: string;
  dirtyByLocation: Record<string, boolean>;
  onLocationSearchChange: (value: string) => void;
  onNewLocationNameChange: (value: string) => void;
  onCreateLocation: () => void;
  onSelectLocation: (locationId: string) => void;
}

export function ShopSidebar({
  locationSearch,
  newLocationName,
  filteredLocations,
  resolvedActiveLocationId,
  dirtyByLocation,
  onLocationSearchChange,
  onNewLocationNameChange,
  onCreateLocation,
  onSelectLocation,
}: ShopSidebarProps) {
  return (
    <aside className="rounded-lg border border-swade-surface-light bg-swade-surface p-3">
      <div className="space-y-2">
        <Label htmlFor="shop-search">Search shops</Label>
        <Input
          id="shop-search"
          value={locationSearch}
          onChange={(event) => onLocationSearchChange(event.target.value)}
          placeholder="Search by name"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={newLocationName}
          onChange={(event) => onNewLocationNameChange(event.target.value)}
          placeholder="New shop"
        />
        <Button type="button" variant="outline" onClick={onCreateLocation}>
          Add
        </Button>
      </div>

      <Separator className="my-3" />

      <ScrollArea className="h-80 pr-2">
        <div className="space-y-1">
          {filteredLocations.map((entry) => {
            const isActive = entry.id === resolvedActiveLocationId;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectLocation(entry.id)}
                className={cn(
                  'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'border-swade-gold bg-swade-surface-light text-swade-gold-light'
                    : 'border-transparent hover:border-swade-surface-light hover:bg-swade-surface-light/70',
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{entry.name}</span>
                  {dirtyByLocation[entry.id] ? (
                    <Badge variant="secondary">Dirty</Badge>
                  ) : (
                    <Badge variant="outline">Synced</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
