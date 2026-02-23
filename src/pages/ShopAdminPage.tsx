import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { PricingProfile } from '@/models/shop';
import { copyTextToClipboard, openPlayerView } from '@/pages/shopAdmin.helpers';
import { buildRuleBasedShopPreview, createDefaultShopRules } from '@/services/shopRules';
import { useShopStore } from '@/store/shopStore';

const PRICING_PROFILES: PricingProfile[] = [
  {
    id: 'default',
    name: 'Default',
    categoryModifiers: {},
    rounding: 'integer',
  },
  {
    id: 'black-market',
    name: 'Black Market',
    categoryModifiers: { firearm: 20, surveillance: 15 },
    rounding: 'integer',
  },
];

const LEGAL_STATUSES = ['legal', 'restricted', 'illegal', 'underground', 'military', 'police'];

type ExceptionMode = 'pin' | 'ban';
type LegalityMode = 'any' | 'legal' | 'illegal' | 'custom';

function toggleValue(values: string[], target: string): string[] {
  return values.includes(target) ? values.filter((item) => item !== target) : [...values, target];
}

export function ShopAdminPage() {
  const navigate = useNavigate();
  const {
    activeSetting,
    syncError,
    isSyncing,
    addLocation,
    removeLocation,
    setLocationRules,
    setLocationShareColumns,
    syncFromServer,
    syncLocationToServer,
    syncToServer,
  } = useShopStore();

  const [newLocationName, setNewLocationName] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [previewSearch, setPreviewSearch] = useState('');
  const [activeLocationId, setActiveLocationId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [manualPriceRaw, setManualPriceRaw] = useState('');
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [exceptionMode, setExceptionMode] = useState<ExceptionMode>('pin');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dirtyByLocation, setDirtyByLocation] = useState<Record<string, boolean>>({});
  const [syncedAtByLocation, setSyncedAtByLocation] = useState<Record<string, string>>({});
  const [debouncedRules, setDebouncedRules] = useState(createDefaultShopRules());

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  const resolvedActiveLocationId =
    activeLocationId && activeSetting.locations.some((location) => location.id === activeLocationId)
      ? activeLocationId
      : activeSetting.locations[0]?.id ?? '';

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!query) {
      return activeSetting.locations;
    }

    return activeSetting.locations.filter((location) =>
      location.name.toLowerCase().includes(query) || location.id.toLowerCase().includes(query),
    );
  }, [activeSetting.locations, locationSearch]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          activeSetting.catalog.map((item) => item.category).filter((item): item is string => Boolean(item)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [activeSetting.catalog],
  );

  const tags = useMemo(
    () =>
      Array.from(new Set(activeSetting.catalog.flatMap((item) => item.tags ?? []))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [activeSetting.catalog],
  );

  const location = activeSetting.locations.find((item) => item.id === resolvedActiveLocationId) ?? null;
  const locationRules = location?.rules ?? createDefaultShopRules();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedRules(locationRules);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [locationRules, resolvedActiveLocationId]);

  const previewPending = debouncedRules !== locationRules;

  const preview = useMemo(
    () =>
      location
        ? buildRuleBasedShopPreview({ catalog: activeSetting.catalog, rules: debouncedRules })
        : { items: [] },
    [activeSetting.catalog, location, debouncedRules],
  );

  const filteredPreviewItems = useMemo(() => {
    const query = previewSearch.trim().toLowerCase();
    if (!query) {
      return preview.items;
    }

    return preview.items.filter((item) => {
      const category = item.category ?? '';
      return item.name.toLowerCase().includes(query) || category.toLowerCase().includes(query);
    });
  }, [preview.items, previewSearch]);

  const selectedPreviewItem = filteredPreviewItems.find((item) => item.id === selectedItemId) ?? null;

  const locationNameById = useMemo(
    () => Object.fromEntries(activeSetting.catalog.map((item) => [item.id, item.name])),
    [activeSetting.catalog],
  );

  const markDirty = (locationId: string) => {
    setDirtyByLocation((current) => ({ ...current, [locationId]: true }));
  };

  const markSynced = (locationIds: string[]) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDirtyByLocation((current) => {
      const next = { ...current };
      for (const locationId of locationIds) {
        next[locationId] = false;
      }
      return next;
    });

    setSyncedAtByLocation((current) => {
      const next = { ...current };
      for (const locationId of locationIds) {
        next[locationId] = timestamp;
      }
      return next;
    });
  };

  const updateLocationRules = (
    updater: (current: ReturnType<typeof createDefaultShopRules>) => ReturnType<typeof createDefaultShopRules>,
  ) => {
    if (!location) {
      return;
    }
    setLocationRules(location.id, updater);
    markDirty(location.id);
  };

  const handleCreateLocation = () => {
    addLocation(newLocationName);
    setNewLocationName('');
  };

  const handleAddException = (itemId: string) => {
    if (!location) {
      return;
    }

    updateLocationRules((current) => ({
      ...current,
      pinnedItemIds:
        exceptionMode === 'pin' ? toggleValue(current.pinnedItemIds, itemId) : current.pinnedItemIds,
      bannedItemIds:
        exceptionMode === 'ban' ? toggleValue(current.bannedItemIds, itemId) : current.bannedItemIds,
    }));
    setExceptionDialogOpen(false);
  };

  const handleCopyLink = async () => {
    if (!location) {
      return;
    }

    const path = `${window.location.origin}/shop/${location.id}`;
    const copied = await copyTextToClipboard(path);
    setToast(copied ? 'Link copied' : 'Unable to copy link');
  };

  const applyManualOverride = () => {
    if (!location || !selectedPreviewItem) {
      return;
    }

    const value = Number(manualPriceRaw);
    if (Number.isNaN(value) || value < 0) {
      return;
    }

    updateLocationRules((current) => ({
      ...current,
      manualPriceOverrides: {
        ...current.manualPriceOverrides,
        [selectedPreviewItem.id]: value,
      },
    }));
    setToast('Manual override saved');
  };

  const handleSyncCurrentShop = async () => {
    if (!location) {
      return;
    }

    const didSync = await syncLocationToServer(location.id);
    if (didSync) {
      markSynced([location.id]);
      setToast('Current shop synced');
      return;
    }

    setToast('Unable to sync current shop');
  };

  const handleSyncAllShops = async () => {
    const didSync = await syncToServer();
    if (didSync) {
      markSynced(activeSetting.locations.map((entry) => entry.id));
      setToast('All shops synced');
      return;
    }

    setToast('Unable to sync all shops');
  };

  const legalityMode: LegalityMode = useMemo(() => {
    if (locationRules.legalStatuses.length === 0) {
      return 'any';
    }

    if (locationRules.legalStatuses.length === 1 && locationRules.legalStatuses[0] === 'legal') {
      return 'legal';
    }

    if (locationRules.legalStatuses.length === 1 && locationRules.legalStatuses[0] === 'illegal') {
      return 'illegal';
    }

    return 'custom';
  }, [locationRules.legalStatuses]);

  const isCurrentLocationDirty = location ? Boolean(dirtyByLocation[location.id]) : false;
  const syncedLabel = location ? syncedAtByLocation[location.id] : '';

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="space-y-6">
      {toast && <Toast>{toast}</Toast>}
      <h1 className="text-2xl font-bold text-swade-gold">Shop Manager</h1>
      <p className="text-sm text-swade-text-muted">
        Configure rule-based shops with a split editor + preview workspace.
      </p>

      {syncError && (
        <Alert variant="destructive">
          <AlertDescription>Sync issue: {syncError}</AlertDescription>
        </Alert>
      )}

      {activeSetting.locations.length === 0 ? (
        <section className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
          <h2 className="text-sm font-semibold text-swade-gold-light">Create first shop</h2>
          <div className="flex gap-2">
            <Input
              value={newLocationName}
              onChange={(event) => setNewLocationName(event.target.value)}
              placeholder="Location name"
            />
            <Button type="button" onClick={handleCreateLocation}>
              Add
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-swade-surface-light bg-swade-surface p-3">
            <div className="space-y-2">
              <Label htmlFor="shop-search">Search shops</Label>
              <Input
                id="shop-search"
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
                placeholder="Search by name"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={newLocationName}
                onChange={(event) => setNewLocationName(event.target.value)}
                placeholder="New shop"
              />
              <Button type="button" variant="outline" onClick={handleCreateLocation}>
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
                      onClick={() => setActiveLocationId(entry.id)}
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

          <section className="space-y-4 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-swade-gold-light">{location?.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge>{preview.items.length} matched</Badge>
                  {isCurrentLocationDirty ? (
                    <Badge variant="secondary">Dirty</Badge>
                  ) : (
                    <Badge variant="outline">{syncedLabel ? `Synced • ${syncedLabel}` : 'Synced'}</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={() => void handleSyncCurrentShop()} disabled={isSyncing || !location}>
                  Sync current shop
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSyncing || !location}
                  onClick={() => location && void openPlayerView(syncLocationToServer, navigate, location.id)}
                >
                  Open Player View
                </Button>
                <Button type="button" variant="outline" disabled={!location} onClick={() => void handleCopyLink()}>
                  Copy Link
                </Button>
                <Button type="button" variant="outline" onClick={() => setAdvancedOpen(true)}>
                  More
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Inventory rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-swade-text-muted">
                      Select item categories and tag rules to define what appears in this shop.
                    </p>

                    <div className="space-y-2">
                      <Label>Categories</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline">
                            Select categories
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Search categories" />
                            <CommandList>
                              <CommandEmpty>No categories found</CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    key={category}
                                    onSelect={() =>
                                      updateLocationRules((current) => ({
                                        ...current,
                                        includeCategories: toggleValue(current.includeCategories, category),
                                      }))
                                    }
                                  >
                                    <Checkbox checked={locationRules.includeCategories.includes(category)} />
                                    <span>{category}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-1">
                        {locationRules.includeCategories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Include tags</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Select include tags
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search tags" />
                              <CommandList>
                                <CommandEmpty>No tags found</CommandEmpty>
                                <CommandGroup>
                                  {tags.map((tag) => (
                                    <CommandItem
                                      key={tag}
                                      onSelect={() =>
                                        updateLocationRules((current) => ({
                                          ...current,
                                          includeTags: toggleValue(current.includeTags, tag),
                                        }))
                                      }
                                    >
                                      <Checkbox checked={locationRules.includeTags.includes(tag)} />
                                      <span>{tag}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-1">
                          {locationRules.includeTags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Exclude tags</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Select exclude tags
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Search tags" />
                              <CommandList>
                                <CommandEmpty>No tags found</CommandEmpty>
                                <CommandGroup>
                                  {tags.map((tag) => (
                                    <CommandItem
                                      key={tag}
                                      onSelect={() =>
                                        updateLocationRules((current) => ({
                                          ...current,
                                          excludeTags: toggleValue(current.excludeTags, tag),
                                        }))
                                      }
                                    >
                                      <Checkbox checked={locationRules.excludeTags.includes(tag)} />
                                      <span>{tag}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-1">
                          {locationRules.excludeTags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Legality and pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-swade-text-muted">
                      Control legal-status filtering and pricing behavior.
                    </p>

                    <div className="space-y-2">
                      <Label>Legality mode</Label>
                      <Select
                        value={legalityMode}
                        onValueChange={(value) => {
                          const mode = value as LegalityMode;
                          if (mode === 'any') {
                            updateLocationRules((current) => ({ ...current, legalStatuses: [] }));
                            return;
                          }
                          if (mode === 'legal') {
                            updateLocationRules((current) => ({ ...current, legalStatuses: ['legal'] }));
                            return;
                          }
                          if (mode === 'illegal') {
                            updateLocationRules((current) => ({ ...current, legalStatuses: ['illegal'] }));
                            return;
                          }
                        }}
                      >
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Select legal statuses
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                  {LEGAL_STATUSES.map((status) => (
                                    <CommandItem
                                      key={status}
                                      onSelect={() =>
                                        updateLocationRules((current) => ({
                                          ...current,
                                          legalStatuses: toggleValue(current.legalStatuses, status),
                                        }))
                                      }
                                    >
                                      <Checkbox checked={locationRules.legalStatuses.includes(status)} />
                                      <span>{status}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                          onChange={(event) =>
                            updateLocationRules((current) => ({
                              ...current,
                              markupPercent: Number(event.target.value || 0),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pricing profile</Label>
                        <Select
                          value={locationRules.pricingProfile.id}
                          onValueChange={(profileId) => {
                            const profile =
                              PRICING_PROFILES.find((entry) => entry.id === profileId) ?? PRICING_PROFILES[0];
                            updateLocationRules((current) => ({
                              ...current,
                              pricingProfile: profile,
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pricing profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICING_PROFILES.map((profile) => (
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
                    <p className="text-sm text-swade-text-muted">
                      Pin or ban specific items regardless of broad rules.
                    </p>

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

                    <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          Add Exception
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add exception</DialogTitle>
                        </DialogHeader>
                        <Select value={exceptionMode} onValueChange={(value) => setExceptionMode(value as ExceptionMode)}>
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
                              {activeSetting.catalog.map((catalogItem) => (
                                <CommandItem key={catalogItem.id} onSelect={() => handleAddException(catalogItem.id)}>
                                  {catalogItem.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setExceptionDialogOpen(false)}>
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Live preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge>{filteredPreviewItems.length} matched</Badge>
                    <Input
                      value={previewSearch}
                      onChange={(event) => setPreviewSearch(event.target.value)}
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
                          <TableRow
                            key={previewItem.id}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedItemId(previewItem.id);
                              setManualPriceRaw(String(locationRules.manualPriceOverrides[previewItem.id] ?? ''));
                            }}
                          >
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

                  <Sheet open={Boolean(selectedPreviewItem)} onOpenChange={(open) => !open && setSelectedItemId(null)}>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>{selectedPreviewItem?.name}</SheetTitle>
                        <SheetDescription>Pin, ban or override this item.</SheetDescription>
                      </SheetHeader>

                      <div className="space-y-3 p-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            selectedPreviewItem &&
                            updateLocationRules((current) => ({
                              ...current,
                              pinnedItemIds: toggleValue(current.pinnedItemIds, selectedPreviewItem.id),
                            }))
                          }
                        >
                          Pin / Unpin
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            selectedPreviewItem &&
                            updateLocationRules((current) => ({
                              ...current,
                              bannedItemIds: toggleValue(current.bannedItemIds, selectedPreviewItem.id),
                            }))
                          }
                        >
                          Ban / Unban
                        </Button>
                        <div className="space-y-2">
                          <Label>Manual price override</Label>
                          <Input
                            value={manualPriceRaw}
                            onChange={(event) => setManualPriceRaw(event.target.value)}
                            type="number"
                          />
                        </div>
                      </div>

                      <SheetFooter>
                        <Button type="button" onClick={applyManualOverride}>
                          Save override
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      )}

      <Sheet open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>More actions</SheetTitle>
            <SheetDescription>Secondary sync and advanced share/debug actions.</SheetDescription>
          </SheetHeader>

          <div className="space-y-4 p-4">
            <Button type="button" variant="outline" disabled={isSyncing} onClick={() => void handleSyncAllShops()}>
              Sync All Shops
            </Button>

            <div className="space-y-2">
              <Label>Player view columns</Label>
              <div className="space-y-2 rounded-md border border-swade-surface-light p-3">
                {['name', 'category', 'notes', 'finalPrice', 'weight'].map((column) => {
                  const selected =
                    (location?.shareColumns ?? ['name', 'category', 'finalPrice', 'weight']).includes(column);
                  return (
                    <label key={column} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => {
                          if (!location) {
                            return;
                          }
                          const next = selected
                            ? (location.shareColumns ?? []).filter((value) => value !== column)
                            : [...(location.shareColumns ?? []), column];
                          setLocationShareColumns(location.id, next);
                          markDirty(location.id);
                        }}
                      />
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

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={!location || isSyncing}>
                  Delete shop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete current shop?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-swade-text-muted">
                  This removes {location?.name ?? 'selected shop'} from the active setting.
                </p>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (!location) {
                        return;
                      }
                      removeLocation(location.id);
                      setDeleteConfirmOpen(false);
                      setToast('Shop deleted');
                    }}
                  >
                    Confirm delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
