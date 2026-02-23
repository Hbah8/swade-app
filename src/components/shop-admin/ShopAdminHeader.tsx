import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ShopAdminHeaderProps {
  locationName?: string;
  matchedCount: number;
  isCurrentLocationDirty: boolean;
  syncedLabel?: string;
  isSyncing: boolean;
  hasLocation: boolean;
  onSyncCurrentShop: () => void;
  onOpenPlayerView: () => void;
  onCopyLink: () => void;
  onOpenMore: () => void;
}

export function ShopAdminHeader({
  locationName,
  matchedCount,
  isCurrentLocationDirty,
  syncedLabel,
  isSyncing,
  hasLocation,
  onSyncCurrentShop,
  onOpenPlayerView,
  onCopyLink,
  onOpenMore,
}: ShopAdminHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-swade-gold-light">{locationName}</h2>
        <div className="mt-1 flex items-center gap-2">
          <Badge>{matchedCount} matched</Badge>
          {isCurrentLocationDirty ? (
            <Badge variant="secondary">Dirty</Badge>
          ) : (
            <Badge variant="outline">{syncedLabel ? `Synced • ${syncedLabel}` : 'Synced'}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onSyncCurrentShop} disabled={isSyncing || !hasLocation}>
          Sync current shop
        </Button>
        <Button type="button" variant="outline" disabled={isSyncing || !hasLocation} onClick={onOpenPlayerView}>
          Open Player View
        </Button>
        <Button type="button" variant="outline" disabled={!hasLocation} onClick={onCopyLink}>
          Copy Link
        </Button>
        <Button type="button" variant="outline" onClick={onOpenMore}>
          More
        </Button>
      </div>
    </div>
  );
}
