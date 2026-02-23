import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PricingProfile, ShopRuleConfig } from '@/models/shop';
import { MultiSelectPicker } from '@/components/shop-admin/MultiSelectPicker';

interface ShopRulesEditorProps {
  categories: string[];
  tags: string[];
  legalStatuses: string[];
  pricingProfiles: PricingProfile[];
  legalityMode: 'any' | 'legal' | 'illegal' | 'custom';
  locationRules: ShopRuleConfig;
  locationNameById: Record<string, string>;
  catalogItems: Array<{ id: string; name: string }>;
  exceptionDialogOpen: boolean;
  exceptionMode: 'pin' | 'ban';
  onExceptionDialogOpenChange: (open: boolean) => void;
  onExceptionModeChange: (mode: 'pin' | 'ban') => void;
  onToggleCategory: (value: string) => void;
  onToggleIncludeTag: (value: string) => void;
  onToggleExcludeTag: (value: string) => void;
  onLegalityModeChange: (mode: 'any' | 'legal' | 'illegal' | 'custom') => void;
  onToggleLegalStatus: (value: string) => void;
  onMarkupChange: (value: number) => void;
  onPricingProfileChange: (profileId: string) => void;
  onAddException: (itemId: string) => void;
}

export function ShopRulesEditor({
  categories,
  tags,
  legalStatuses,
  pricingProfiles,
  legalityMode,
  locationRules,
  locationNameById,
  catalogItems,
  exceptionDialogOpen,
  exceptionMode,
  onExceptionDialogOpenChange,
  onExceptionModeChange,
  onToggleCategory,
  onToggleIncludeTag,
  onToggleExcludeTag,
  onLegalityModeChange,
  onToggleLegalStatus,
  onMarkupChange,
  onPricingProfileChange,
  onAddException,
}: ShopRulesEditorProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-swade-text-muted">
            Select item categories and tag rules to define what appears in this shop.
          </p>

          <MultiSelectPicker
            label="Categories"
            triggerLabel="Select categories"
            searchPlaceholder="Search categories"
            emptyText="No categories found"
            options={categories}
            selected={locationRules.includeCategories}
            onToggle={onToggleCategory}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <MultiSelectPicker
              label="Include tags"
              triggerLabel="Select include tags"
              searchPlaceholder="Search tags"
              emptyText="No tags found"
              options={tags}
              selected={locationRules.includeTags}
              onToggle={onToggleIncludeTag}
            />

            <MultiSelectPicker
              label="Exclude tags"
              triggerLabel="Select exclude tags"
              searchPlaceholder="Search tags"
              emptyText="No tags found"
              options={tags}
              selected={locationRules.excludeTags}
              onToggle={onToggleExcludeTag}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legality and pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-swade-text-muted">Control legal-status filtering and pricing behavior.</p>

          <div className="space-y-2">
            <Label>Legality mode</Label>
            <Select value={legalityMode} onValueChange={(value) => onLegalityModeChange(value as 'any' | 'legal' | 'illegal' | 'custom')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="legal">Legal only</SelectItem>
                <SelectItem value="illegal">Illegal only</SelectItem>
                <SelectItem value="custom">Custom…</SelectItem>
              </SelectContent>
            </Select>

            {legalityMode === 'custom' && (
              <MultiSelectPicker
                label="Legal statuses"
                triggerLabel="Select legal statuses"
                searchPlaceholder="Search statuses"
                emptyText="No statuses found"
                options={legalStatuses}
                selected={locationRules.legalStatuses}
                onToggle={onToggleLegalStatus}
              />
            )}

            <div className="flex flex-wrap gap-1">
              {locationRules.legalStatuses.length === 0 ? (
                <Badge variant="outline">Any</Badge>
              ) : (
                locationRules.legalStatuses.map((status) => (
                  <Badge key={status} variant="secondary">
                    {status}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Markup %</Label>
              <Input
                type="number"
                value={locationRules.markupPercent}
                onChange={(event) => onMarkupChange(Number(event.target.value || 0))}
              />
            </div>
            <div className="space-y-2">
              <Label>Pricing profile</Label>
              <Select value={locationRules.pricingProfile.id} onValueChange={onPricingProfileChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing profile" />
                </SelectTrigger>
                <SelectContent>
                  {pricingProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exceptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-swade-text-muted">Pin or ban specific items regardless of broad rules.</p>

          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pinned</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-28">
                  <div className="space-y-1 text-sm">
                    {locationRules.pinnedItemIds.length === 0
                      ? 'No pinned items'
                      : locationRules.pinnedItemIds.map((id) => <div key={id}>{locationNameById[id] ?? id}</div>)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Banned</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-28">
                  <div className="space-y-1 text-sm">
                    {locationRules.bannedItemIds.length === 0
                      ? 'No banned items'
                      : locationRules.bannedItemIds.map((id) => <div key={id}>{locationNameById[id] ?? id}</div>)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Dialog open={exceptionDialogOpen} onOpenChange={onExceptionDialogOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Add Exception
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add exception</DialogTitle>
              </DialogHeader>
              <Select value={exceptionMode} onValueChange={(value) => onExceptionModeChange(value as 'pin' | 'ban')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pin">Pin</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                </SelectContent>
              </Select>

              <Command>
                <CommandInput placeholder="Search items" />
                <CommandList>
                  <CommandEmpty>No items found</CommandEmpty>
                  <CommandGroup>
                    {catalogItems.map((catalogItem) => (
                      <CommandItem key={catalogItem.id} onSelect={() => onAddException(catalogItem.id)}>
                        {catalogItem.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onExceptionDialogOpenChange(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
