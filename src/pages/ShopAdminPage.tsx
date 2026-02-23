import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { copyTextToClipboard, openPlayerView } from '@/pages/shopAdmin.helpers';
import type { PricingProfile } from '@/models/shop';
import { buildRuleBasedShopPreview, createDefaultShopRules } from '@/services/shopRules';
import { useShopStore } from '@/store/shopStore';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';

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
    syncToServer,
  } = useShopStore();

  const [newLocationName, setNewLocationName] = useState('');
  const [activeLocationId, setActiveLocationId] = useState<string>('');
  const [rulesTab, setRulesTab] = useState<'rules' | 'preview' | 'share'>('rules');
  const [categoryCandidate, setCategoryCandidate] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [manualPriceRaw, setManualPriceRaw] = useState('');
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [exceptionMode, setExceptionMode] = useState<'pin' | 'ban'>('pin');
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  const resolvedActiveLocationId =
    activeLocationId && activeSetting.locations.some((location) => location.id === activeLocationId)
      ? activeLocationId
      : activeSetting.locations[0]?.id ?? '';

  const categories = useMemo(
    () => Array.from(new Set(activeSetting.catalog.map((item) => item.category).filter((item): item is string => Boolean(item)))).sort((a, b) => a.localeCompare(b)),
    [activeSetting.catalog],
  );

  const tags = useMemo(
    () => Array.from(new Set(activeSetting.catalog.flatMap((item) => item.tags ?? []))).sort((a, b) => a.localeCompare(b)),
    [activeSetting.catalog],
  );

  const location = activeSetting.locations.find((item) => item.id === resolvedActiveLocationId) ?? null;
  const locationRules = location?.rules ?? createDefaultShopRules();
  const preview = useMemo(
    () => (location ? buildRuleBasedShopPreview({ catalog: activeSetting.catalog, rules: locationRules }) : { items: [] }),
    [activeSetting.catalog, location, locationRules],
  );

  const selectedPreviewItem = preview.items.find((item) => item.id === selectedItemId) ?? null;

  const updateLocationRules = (updater: (current: ReturnType<typeof createDefaultShopRules>) => ReturnType<typeof createDefaultShopRules>) => {
    if (!location) {
      return;
    }
    setLocationRules(location.id, updater);
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
      pinnedItemIds: exceptionMode === 'pin' ? toggleValue(current.pinnedItemIds, itemId) : current.pinnedItemIds,
      bannedItemIds: exceptionMode === 'ban' ? toggleValue(current.bannedItemIds, itemId) : current.bannedItemIds,
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
        Define rule-based shop inventories per location and share read-only player links.
      </p>

      {syncError && (
        <Alert variant="destructive">
          <AlertDescription>Sync issue: {syncError}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
        <h2 className="text-sm font-semibold text-swade-gold-light">Locations</h2>
        <div className="flex gap-2">
          <Input
            value={newLocationName}
            onChange={(event) => setNewLocationName(event.target.value)}
            placeholder="Location name"
          />
          <Button type="button" onClick={handleCreateLocation}>
            Add
          </Button>
          <Button type="button" variant="outline" onClick={() => void syncToServer()} disabled={isSyncing}>
            Save to LAN Server
          </Button>
        </div>
      </section>

      {activeSetting.locations.length === 0 ? (
        <p className="text-sm text-swade-text-muted">Create at least one location to configure rule-based shops.</p>
      ) : (
        <Tabs value={resolvedActiveLocationId} onValueChange={setActiveLocationId}>
          <TabsList>
            {activeSetting.locations.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeSetting.locations.map((item) => {
            const itemRules = item.rules ?? createDefaultShopRules();
            const itemPreview = buildRuleBasedShopPreview({ catalog: activeSetting.catalog, rules: itemRules });
            const requiresTags = itemRules.includeTags.length > 0 || itemRules.excludeTags.length > 0;
            const requiresLegal = itemRules.legalStatuses.length > 0;
            const missingTags = activeSetting.catalog.some((catalogItem) => !catalogItem.tags || catalogItem.tags.length === 0);
            const missingLegal = activeSetting.catalog.some((catalogItem) => !catalogItem.legalStatus);
            const hasMetadataBlockingIssue = (requiresTags && missingTags) || (requiresLegal && missingLegal);

            return (
              <TabsContent key={item.id} value={item.id}>
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>{item.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge>{itemPreview.items.length} matched</Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={isSyncing}
                        onClick={() => {
                          removeLocation(item.id);
                          setToast('Shop deleted');
                        }}
                      >
                        Delete shop
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isSyncing}
                        onClick={() => void openPlayerView(syncToServer, navigate, item.id)}
                      >
                        Player View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {hasMetadataBlockingIssue && (
                      <Alert variant="warning" className="mb-4">
                        <AlertDescription>
                          Rule filters require missing metadata. Resolve catalog health issues before relying on this rule output.
                          <div className="mt-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => navigate('/catalog?tab=Health')}>
                              Open Catalog Health
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Tabs value={rulesTab} onValueChange={(value) => setRulesTab(value as 'rules' | 'preview' | 'share')}>
                      <TabsList>
                        <TabsTrigger value="rules">Rules</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="share">Share</TabsTrigger>
                      </TabsList>

                      <TabsContent value="rules" className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Include categories</Label>
                            <div className="flex gap-2">
                              <Select value={categoryCandidate} onValueChange={setCategoryCandidate}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (!categoryCandidate) return;
                                  setLocationRules(item.id, (current) => ({
                                    ...current,
                                    includeCategories: toggleValue(current.includeCategories, categoryCandidate),
                                  }));
                                }}
                              >
                                Toggle
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {itemRules.includeCategories.map((category) => (
                                <Badge key={category} variant="secondary">{category}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Markup %</Label>
                            <Input
                              type="number"
                              value={itemRules.markupPercent}
                              onChange={(event) =>
                                setLocationRules(item.id, (current) => ({
                                  ...current,
                                  markupPercent: Number(event.target.value || 0),
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Include tags</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button type="button" variant="outline">Select include tags</Button>
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
                                            setLocationRules(item.id, (current) => ({
                                              ...current,
                                              includeTags: toggleValue(current.includeTags, tag),
                                            }))
                                          }
                                        >
                                          <Checkbox checked={itemRules.includeTags.includes(tag)} />
                                          <span>{tag}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>Exclude tags</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button type="button" variant="outline">Select exclude tags</Button>
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
                                            setLocationRules(item.id, (current) => ({
                                              ...current,
                                              excludeTags: toggleValue(current.excludeTags, tag),
                                            }))
                                          }
                                        >
                                          <Checkbox checked={itemRules.excludeTags.includes(tag)} />
                                          <span>{tag}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Legality filter</Label>
                              <Switch
                                checked={itemRules.legalStatuses.length > 0}
                                onCheckedChange={(checked) =>
                                  setLocationRules(item.id, (current) => ({
                                    ...current,
                                    legalStatuses: checked ? ['legal'] : [],
                                  }))
                                }
                              />
                            </div>
                            {itemRules.legalStatuses.length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button type="button" variant="outline">Select legal statuses</Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                  <Command>
                                    <CommandList>
                                      <CommandGroup>
                                        {LEGAL_STATUSES.map((status) => (
                                          <CommandItem
                                            key={status}
                                            onSelect={() =>
                                              setLocationRules(item.id, (current) => ({
                                                ...current,
                                                legalStatuses: toggleValue(current.legalStatuses, status),
                                              }))
                                            }
                                          >
                                            <Checkbox checked={itemRules.legalStatuses.includes(status)} />
                                            <span>{status}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Pricing profile</Label>
                            <Select
                              value={itemRules.pricingProfile.id}
                              onValueChange={(profileId) => {
                                const profile = PRICING_PROFILES.find((entry) => entry.id === profileId) ?? PRICING_PROFILES[0];
                                setLocationRules(item.id, (current) => ({
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

                        <div className="space-y-2">
                          <Label>Exceptions</Label>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-sm">Pinned</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-28">
                                  <div className="space-y-1 text-sm">
                                    {itemRules.pinnedItemIds.length === 0 ? 'No pinned items' : itemRules.pinnedItemIds.map((id) => <div key={id}>{id}</div>)}
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
                                    {itemRules.bannedItemIds.length === 0 ? 'No banned items' : itemRules.bannedItemIds.map((id) => <div key={id}>{id}</div>)}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </div>

                          <Dialog open={exceptionDialogOpen} onOpenChange={setExceptionDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">Add Exception</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add exception</DialogTitle>
                              </DialogHeader>
                              <Select value={exceptionMode} onValueChange={(value) => setExceptionMode(value as 'pin' | 'ban')}>
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
                        </div>
                      </TabsContent>

                      <TabsContent value="preview">
                        <Table aria-label="Shop preview items">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itemPreview.items.map((previewItem) => (
                              <TableRow
                                key={previewItem.id}
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedItemId(previewItem.id);
                                  setManualPriceRaw(String(itemRules.manualPriceOverrides[previewItem.id] ?? ''));
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
                                  setLocationRules(item.id, (current) => ({
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
                                  setLocationRules(item.id, (current) => ({
                                    ...current,
                                    bannedItemIds: toggleValue(current.bannedItemIds, selectedPreviewItem.id),
                                  }))
                                }
                              >
                                Ban / Unban
                              </Button>
                              <div className="space-y-2">
                                <Label>Manual price override</Label>
                                <Input value={manualPriceRaw} onChange={(event) => setManualPriceRaw(event.target.value)} type="number" />
                              </div>
                            </div>

                            <SheetFooter>
                              <Button type="button" onClick={applyManualOverride}>Save override</Button>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      </TabsContent>

                      <TabsContent value="share" className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline">Columns</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="space-y-2">
                                {['name', 'category', 'notes', 'finalPrice', 'weight'].map((column) => {
                                  const selected = (item.shareColumns ?? ['name', 'category', 'finalPrice', 'weight']).includes(column);
                                  return (
                                    <label key={column} className="flex items-center gap-2 text-sm">
                                      <Checkbox
                                        checked={selected}
                                        onCheckedChange={() => {
                                          const next = selected
                                            ? (item.shareColumns ?? []).filter((value) => value !== column)
                                            : [...(item.shareColumns ?? []), column];
                                          setLocationShareColumns(item.id, next);
                                        }}
                                      />
                                      <span>{column}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>

                          <Button type="button" onClick={() => void handleCopyLink()}>Copy link</Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
