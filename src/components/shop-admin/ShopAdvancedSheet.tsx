import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ShopLocation, ShopRuleConfig } from '@/models/shop';

interface ShopAdvancedSheetProps {
  advancedOpen: boolean;
  deleteConfirmOpen: boolean;
  isSyncing: boolean;
  location: ShopLocation | null;
  locationRules: ShopRuleConfig;
  onAdvancedOpenChange: (open: boolean) => void;
  onDeleteConfirmOpenChange: (open: boolean) => void;
  onSyncAllShops: () => void;
  onToggleShareColumn: (column: string) => void;
  onConfirmDelete: () => void;
}

const SHARE_COLUMNS = ['name', 'category', 'notes', 'finalPrice', 'weight'];

export function ShopAdvancedSheet({
  advancedOpen,
  deleteConfirmOpen,
  isSyncing,
  location,
  locationRules,
  onAdvancedOpenChange,
  onDeleteConfirmOpenChange,
  onSyncAllShops,
  onToggleShareColumn,
  onConfirmDelete,
}: ShopAdvancedSheetProps) {
  const shareColumns = location?.shareColumns ?? ['name', 'category', 'finalPrice', 'weight'];

  return (
    <Sheet open={advancedOpen} onOpenChange={onAdvancedOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>More actions</SheetTitle>
          <SheetDescription>Secondary sync and advanced share/debug actions.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <Button type="button" variant="outline" disabled={isSyncing} onClick={onSyncAllShops}>
            Sync All Shops
          </Button>

          <div className="space-y-2">
            <Label>Player view columns</Label>
            <div className="space-y-2 rounded-md border border-swade-surface-light p-3">
              {SHARE_COLUMNS.map((column) => {
                const selected = shareColumns.includes(column);
                return (
                  <label key={column} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={selected} onCheckedChange={() => onToggleShareColumn(column)} />
                    <span>{column}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Debug rules JSON</Label>
            <pre className="max-h-56 overflow-auto rounded-md border border-swade-surface-light bg-swade-bg/40 p-3 text-xs">
              {JSON.stringify(locationRules, null, 2)}
            </pre>
          </div>

          <Dialog open={deleteConfirmOpen} onOpenChange={onDeleteConfirmOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={!location || isSyncing}>
                Delete shop
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete current shop?</DialogTitle>
                <DialogDescription>
                  This removes {location?.name ?? 'selected shop'} from the active setting.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onDeleteConfirmOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive" onClick={onConfirmDelete}>
                  Confirm delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
