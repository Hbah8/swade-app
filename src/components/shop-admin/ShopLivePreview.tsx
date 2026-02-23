import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RuleBasedPreviewResult } from '@/services/shopRules';

interface ShopLivePreviewProps {
  filteredPreviewItems: RuleBasedPreviewResult['items'];
  previewPending: boolean;
  previewSearch: string;
  manualPriceRaw: string;
  selectedPreviewItem: RuleBasedPreviewResult['items'][number] | null;
  manualOverrideValue?: number;
  onPreviewSearchChange: (value: string) => void;
  onSelectPreviewItem: (itemId: string) => void;
  onCloseDetails: () => void;
  onManualPriceRawChange: (value: string) => void;
  onPinToggle: () => void;
  onBanToggle: () => void;
  onSaveOverride: () => void;
}

export function ShopLivePreview({
  filteredPreviewItems,
  previewPending,
  previewSearch,
  manualPriceRaw,
  selectedPreviewItem,
  manualOverrideValue,
  onPreviewSearchChange,
  onSelectPreviewItem,
  onCloseDetails,
  onManualPriceRawChange,
  onPinToggle,
  onBanToggle,
  onSaveOverride,
}: ShopLivePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge>{filteredPreviewItems.length} matched</Badge>
          <Input
            value={previewSearch}
            onChange={(event) => onPreviewSearchChange(event.target.value)}
            placeholder="Search preview items"
            className="max-w-xs"
          />
        </div>

        {previewPending && (
          <Alert>
            <AlertDescription>Updating preview…</AlertDescription>
          </Alert>
        )}

        {filteredPreviewItems.length === 0 ? (
          <Alert>
            <AlertDescription>No matching items. Adjust category/tag/legal filters.</AlertDescription>
          </Alert>
        ) : (
          <Table aria-label="Shop preview items">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreviewItems.map((previewItem) => (
                <TableRow key={previewItem.id} className="cursor-pointer" onClick={() => onSelectPreviewItem(previewItem.id)}>
                  <TableCell>{previewItem.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{previewItem.source}</Badge>
                  </TableCell>
                  <TableCell>
                    {previewItem.finalPrice}
                    {previewItem.source === 'override' ? ' (override)' : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Sheet open={Boolean(selectedPreviewItem)} onOpenChange={(open) => !open && onCloseDetails()}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedPreviewItem?.name}</SheetTitle>
              <SheetDescription>Pin, ban or override this item.</SheetDescription>
            </SheetHeader>

            <div className="space-y-3 p-4">
              <Button type="button" variant="outline" onClick={onPinToggle}>
                Pin / Unpin
              </Button>
              <Button type="button" variant="outline" onClick={onBanToggle}>
                Ban / Unban
              </Button>
              <div className="space-y-2">
                <Label>Manual price override</Label>
                <Input value={manualPriceRaw} onChange={(event) => onManualPriceRawChange(event.target.value)} type="number" />
              </div>
              {typeof manualOverrideValue === 'number' && (
                <p className="text-xs text-swade-text-muted">Current override: {manualOverrideValue}</p>
              )}
            </div>

            <SheetFooter>
              <Button type="button" onClick={onSaveOverride}>
                Save override
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
