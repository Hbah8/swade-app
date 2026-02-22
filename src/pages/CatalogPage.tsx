import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BUILT_IN_CATALOG_SETS, VEGAS_TAG_POOL } from '@/data/shopBuiltInCatalog';
import { parseEquipmentCatalog } from '@/services/shopService';
import { useShopStore } from '@/store/shopStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';

type ImportMode = 'merge' | 'replace' | 'append';
type ItemFilter = 'all' | 'missing-tags' | 'missing-legal' | 'unknown-tags';

const CATEGORIES = ['firearm', 'melee', 'tool', 'cleaning', 'disposal', 'surveillance', 'interrogation', 'deception', 'restraint', 'medical'];

export function CatalogPage() {
  const { activeSetting, importCatalog, addCatalogItem, cloneCatalogItemToCustom, deleteCatalogItem, syncToServer } = useShopStore();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab')?.toLowerCase() === 'health' ? 'health' : 'items');
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('tool');
  const [basePrice, setBasePrice] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [legalStatus, setLegalStatus] = useState('legal');
  const [formError, setFormError] = useState<string | null>(null);

  const [importPayload, setImportPayload] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [importWarning, setImportWarning] = useState<string | null>(null);
  const [isImportPayloadValid, setIsImportPayloadValid] = useState(false);

  const unknownTagSet = useMemo(() => {
    const knownTags = new Set(VEGAS_TAG_POOL);
    const values = new Set<string>();
    activeSetting.catalog.forEach((item) => {
      (item.tags ?? []).forEach((tag) => {
        if (!knownTags.has(tag as (typeof VEGAS_TAG_POOL)[number])) {
          values.add(tag);
        }
      });
    });
    return values;
  }, [activeSetting.catalog]);

  const itemsMissingTags = useMemo(() => activeSetting.catalog.filter((item) => !item.tags || item.tags.length === 0), [activeSetting.catalog]);
  const itemsMissingLegal = useMemo(() => activeSetting.catalog.filter((item) => !item.legalStatus), [activeSetting.catalog]);

  const filteredItems = useMemo(() => {
    if (itemFilter === 'missing-tags') {
      return itemsMissingTags;
    }
    if (itemFilter === 'missing-legal') {
      return itemsMissingLegal;
    }
    if (itemFilter === 'unknown-tags') {
      return activeSetting.catalog.filter((item) => (item.tags ?? []).some((tag) => unknownTagSet.has(tag)));
    }
    return activeSetting.catalog;
  }, [activeSetting.catalog, itemFilter, itemsMissingLegal, itemsMissingTags, unknownTagSet]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleAddItem = () => {
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!basePrice || Number(basePrice) < 0) {
      setFormError('Base price must be a non-negative number');
      return;
    }
    if (!weight || Number(weight) < 0) {
      setFormError('Weight must be a non-negative number');
      return;
    }

    const id = `custom-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    addCatalogItem({
      id,
      name: name.trim(),
      category,
      basePrice: Number(basePrice),
      weight: Number(weight),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      tags: selectedTags,
      legalStatus,
      source: 'custom',
    });

    setName('');
    setBasePrice('');
    setWeight('');
    setNotes('');
    setSelectedTags([]);
    setFormError(null);
    setToast('Item created');
  };

  const handleValidateImport = () => {
    setImportError(null);
    setImportWarning(null);
    setIsImportPayloadValid(false);

    try {
      const parsed = parseEquipmentCatalog(importPayload);
      const known = new Set(VEGAS_TAG_POOL);
      const foundUnknown = new Set<string>();
      parsed.items.forEach((item) => {
        (item.tags ?? []).forEach((tag) => {
          if (!known.has(tag as (typeof VEGAS_TAG_POOL)[number])) {
            foundUnknown.add(tag);
          }
        });
      });

      if (foundUnknown.size > 0) {
        setImportWarning(`Unknown tags: ${[...foundUnknown].join(', ')}`);
      }
      setIsImportPayloadValid(true);
    } catch {
      setImportError('Schema validation failed for import payload');
      setIsImportPayloadValid(false);
    }
  };

  const handleImport = async () => {
    if (!isImportPayloadValid) {
      return;
    }

    setImportError(null);
    setImportWarning(null);

    try {
      const parsed = parseEquipmentCatalog(importPayload);
      const importedItems = parsed.items.map((item) => ({ ...item, source: 'imported' as const }));

      if (importMode === 'replace') {
        importCatalog(importedItems);
      } else {
        const byId = new Map(activeSetting.catalog.map((item) => [item.id, item]));
        importedItems.forEach((item) => byId.set(item.id, item));
        const finalItems = importMode === 'append' ? [...activeSetting.catalog, ...importedItems] : [...byId.values()];
        importCatalog(finalItems);
      }

      const didSync = await syncToServer();
      setToast(didSync ? 'Import completed' : 'Import completed locally. Server sync failed');
      setIsImportPayloadValid(true);
    } catch {
      setImportError('Schema validation failed for import payload');
      setIsImportPayloadValid(false);
    }
  };

  const applyHealthFilter = (filter: ItemFilter) => {
    setItemFilter(filter);
    setActiveTab('items');
  };

  return (
    <div className="space-y-4">
      {toast && <Toast>{toast}</Toast>}

      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-swade-gold">Catalog</h1>
          <p className="text-sm text-swade-text-muted">Setting: {activeSetting.name}</p>
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>Add Item</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Custom Item</SheetTitle>
                <SheetDescription>Create a custom catalog item without JSON.</SheetDescription>
              </SheetHeader>

              <div className="space-y-3 p-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="catalog-item-name">Name</Label>
                  <Input id="catalog-item-name" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((entry) => (
                        <SelectItem key={entry} value={entry}>{entry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catalog-item-base-price">Base price</Label>
                  <Input id="catalog-item-base-price" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catalog-item-weight">Weight</Label>
                  <Input id="catalog-item-weight" value={weight} onChange={(event) => setWeight(event.target.value)} type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catalog-item-notes">Notes</Label>
                  <Input id="catalog-item-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional item notes" />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-start">
                        {selectedTags.length > 0 ? selectedTags.join(', ') : 'Select tags'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Search tags" />
                        <CommandList>
                          <CommandEmpty>No tags found</CommandEmpty>
                          <CommandGroup>
                            {VEGAS_TAG_POOL.map((tag) => (
                              <CommandItem
                                key={tag}
                                onSelect={() =>
                                  setSelectedTags((previous) =>
                                    previous.includes(tag)
                                      ? previous.filter((value) => value !== tag)
                                      : [...previous, tag],
                                  )
                                }
                              >
                                <Checkbox checked={selectedTags.includes(tag)} />
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
                  <Label>Legal status</Label>
                  <Select value={legalStatus} onValueChange={setLegalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">legal</SelectItem>
                      <SelectItem value="restricted">restricted</SelectItem>
                      <SelectItem value="illegal">illegal</SelectItem>
                      <SelectItem value="underground">underground</SelectItem>
                      <SelectItem value="military">military</SelectItem>
                      <SelectItem value="police">police</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <SheetFooter>
                <Button onClick={handleAddItem}>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Import Pack</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Pack</DialogTitle>
                <DialogDescription>Import JSON payload into current setting catalog.</DialogDescription>
              </DialogHeader>

              <Tabs
                value={importMode}
                onValueChange={(value) => {
                  setImportMode(value as ImportMode);
                  setImportError(null);
                  setImportWarning(null);
                  setIsImportPayloadValid(false);
                }}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="merge">Merge</TabsTrigger>
                  <TabsTrigger value="replace">Replace</TabsTrigger>
                  <TabsTrigger value="append">Append</TabsTrigger>
                </TabsList>
              </Tabs>

              <textarea
                className="min-h-[180px] w-full rounded-md border border-swade-surface-light bg-swade-bg p-3 text-sm"
                value={importPayload}
                onChange={(event) => {
                  setImportPayload(event.target.value);
                  setImportError(null);
                  setImportWarning(null);
                  setIsImportPayloadValid(false);
                }}
              />

              {importError && (
                <Alert variant="destructive">
                  <AlertDescription>{importError}</AlertDescription>
                </Alert>
              )}
              {importWarning && (
                <Alert variant="warning">
                  <AlertDescription>{importWarning}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handleValidateImport}>Validate</Button>
                <Button onClick={() => void handleImport()} disabled={!isImportPayloadValid}>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="sets">Sets</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-swade-text-muted">Filter: {itemFilter}</p>
            {itemFilter !== 'all' && <Button size="sm" variant="outline" onClick={() => setItemFilter('all')}>Clear filter</Button>}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const sourceLabel = item.source === 'built-in' ? 'Built-in' : item.source === 'imported' ? 'Imported' : 'Custom';
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category ?? '—'}</TableCell>
                    <TableCell>{item.basePrice}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell><Badge>{sourceLabel}</Badge></TableCell>
                    <TableCell className="flex gap-2">
                      {item.source === 'built-in' && (
                        <Button size="sm" variant="outline" onClick={() => { cloneCatalogItemToCustom(item.id); setToast('Built-in item cloned to Custom'); }}>
                          Clone
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={item.source === 'built-in'}
                        onClick={() => {
                          const deleted = deleteCatalogItem(item.id);
                          setToast(deleted ? 'Item deleted' : 'Built-in items cannot be deleted');
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="sets" className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {BUILT_IN_CATALOG_SETS.map((set) => (
            <Card key={set.id}>
              <CardHeader>
                <CardTitle className="text-base">{set.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge>{set.itemIds.length} items</Badge>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('items')}>
                  View items
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tags" className="space-y-2">
          <p className="text-sm text-swade-text-muted">Canonical tags for this setting.</p>
          <div className="flex flex-wrap gap-2">
            {VEGAS_TAG_POOL.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-2">
          <Alert variant="warning">
            <AlertDescription>
              <p className="font-medium">Items missing tags: {itemsMissingTags.length}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => applyHealthFilter('missing-tags')}>Filter in Items</Button>
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertDescription>
              <p className="font-medium">Items missing legalStatus: {itemsMissingLegal.length}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => applyHealthFilter('missing-legal')}>Filter in Items</Button>
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertDescription>
              <p className="font-medium">Unknown tags: {unknownTagSet.size}</p>
              <p className="text-xs text-swade-text-muted">{[...unknownTagSet].join(', ') || 'None'}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => applyHealthFilter('unknown-tags')}>Filter in Items</Button>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
