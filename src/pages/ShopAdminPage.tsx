import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateFirstShopCard } from '@/components/shop-admin/CreateFirstShopCard';
import { ShopAdminHeader } from '@/components/shop-admin/ShopAdminHeader';
import { ShopAdvancedSheet } from '@/components/shop-admin/ShopAdvancedSheet';
import { LEGAL_STATUSES, PRICING_PROFILES, toggleValue } from '@/components/shop-admin/config';
import { ShopLivePreview } from '@/components/shop-admin/ShopLivePreview';
import { ShopRulesEditor } from '@/components/shop-admin/ShopRulesEditor';
import { ShopSidebar } from '@/components/shop-admin/ShopSidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toast } from '@/components/ui/toast';
import type { ShopRuleConfig } from '@/models/shop';
import { copyTextToClipboard, openPlayerView } from '@/pages/shopAdmin.helpers';
import { buildRuleBasedShopPreview, createDefaultShopRules } from '@/services/shopRules';
import { useShopStore } from '@/store/shopStore';

type ExceptionMode = 'pin' | 'ban';
type LegalityMode = 'any' | 'legal' | 'illegal' | 'custom';

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

  const updateLocationRules = (updater: (current: ShopRuleConfig) => ShopRuleConfig) => {
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

  const handleToggleShareColumn = (column: string) => {
    if (!location) {
      return;
    }

    const selected = (location.shareColumns ?? ['name', 'category', 'finalPrice', 'weight']).includes(column);
    const next = selected
      ? (location.shareColumns ?? []).filter((value) => value !== column)
      : [...(location.shareColumns ?? []), column];

    setLocationShareColumns(location.id, next);
    markDirty(location.id);
  };

  const handleDeleteCurrentShop = () => {
    if (!location) {
      return;
    }

    removeLocation(location.id);
    setDeleteConfirmOpen(false);
    setToast('Shop deleted');
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
      <p className="text-sm text-swade-text-muted">Configure rule-based shops with a split editor + preview workspace.</p>

      {syncError && (
        <Alert variant="destructive">
          <AlertDescription>Sync issue: {syncError}</AlertDescription>
        </Alert>
      )}

      {activeSetting.locations.length === 0 ? (
        <CreateFirstShopCard
          newLocationName={newLocationName}
          onNewLocationNameChange={setNewLocationName}
          onCreateLocation={handleCreateLocation}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ShopSidebar
            locationSearch={locationSearch}
            newLocationName={newLocationName}
            filteredLocations={filteredLocations}
            resolvedActiveLocationId={resolvedActiveLocationId}
            dirtyByLocation={dirtyByLocation}
            onLocationSearchChange={setLocationSearch}
            onNewLocationNameChange={setNewLocationName}
            onCreateLocation={handleCreateLocation}
            onSelectLocation={setActiveLocationId}
          />

          <section className="space-y-4 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
            <ShopAdminHeader
              locationName={location?.name}
              matchedCount={preview.items.length}
              isCurrentLocationDirty={isCurrentLocationDirty}
              syncedLabel={syncedLabel}
              isSyncing={isSyncing}
              hasLocation={Boolean(location)}
              onSyncCurrentShop={() => void handleSyncCurrentShop()}
              onOpenPlayerView={() => location && void openPlayerView(syncLocationToServer, navigate, location.id)}
              onCopyLink={() => void handleCopyLink()}
              onOpenMore={() => setAdvancedOpen(true)}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <ShopRulesEditor
                categories={categories}
                tags={tags}
                legalStatuses={LEGAL_STATUSES}
                pricingProfiles={PRICING_PROFILES}
                legalityMode={legalityMode}
                locationRules={locationRules}
                locationNameById={locationNameById}
                catalogItems={activeSetting.catalog.map((item) => ({ id: item.id, name: item.name }))}
                exceptionDialogOpen={exceptionDialogOpen}
                exceptionMode={exceptionMode}
                onExceptionDialogOpenChange={setExceptionDialogOpen}
                onExceptionModeChange={setExceptionMode}
                onToggleCategory={(category) =>
                  updateLocationRules((current) => ({
                    ...current,
                    includeCategories: toggleValue(current.includeCategories, category),
                  }))
                }
                onToggleIncludeTag={(tag) =>
                  updateLocationRules((current) => ({
                    ...current,
                    includeTags: toggleValue(current.includeTags, tag),
                  }))
                }
                onToggleExcludeTag={(tag) =>
                  updateLocationRules((current) => ({
                    ...current,
                    excludeTags: toggleValue(current.excludeTags, tag),
                  }))
                }
                onLegalityModeChange={(mode) => {
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
                onToggleLegalStatus={(status) =>
                  updateLocationRules((current) => ({
                    ...current,
                    legalStatuses: toggleValue(current.legalStatuses, status),
                  }))
                }
                onMarkupChange={(value) => updateLocationRules((current) => ({ ...current, markupPercent: value }))}
                onPricingProfileChange={(profileId) => {
                  const profile = PRICING_PROFILES.find((entry) => entry.id === profileId) ?? PRICING_PROFILES[0];
                  updateLocationRules((current) => ({
                    ...current,
                    pricingProfile: profile,
                  }));
                }}
                onAddException={handleAddException}
              />

              <ShopLivePreview
                filteredPreviewItems={filteredPreviewItems}
                previewPending={previewPending}
                previewSearch={previewSearch}
                manualPriceRaw={manualPriceRaw}
                selectedPreviewItem={selectedPreviewItem}
                manualOverrideValue={
                  selectedPreviewItem ? locationRules.manualPriceOverrides[selectedPreviewItem.id] : undefined
                }
                onPreviewSearchChange={setPreviewSearch}
                onSelectPreviewItem={(itemId) => {
                  setSelectedItemId(itemId);
                  setManualPriceRaw(String(locationRules.manualPriceOverrides[itemId] ?? ''));
                }}
                onCloseDetails={() => setSelectedItemId(null)}
                onManualPriceRawChange={setManualPriceRaw}
                onPinToggle={() => {
                  if (!selectedPreviewItem) {
                    return;
                  }
                  updateLocationRules((current) => ({
                    ...current,
                    pinnedItemIds: toggleValue(current.pinnedItemIds, selectedPreviewItem.id),
                  }));
                }}
                onBanToggle={() => {
                  if (!selectedPreviewItem) {
                    return;
                  }
                  updateLocationRules((current) => ({
                    ...current,
                    bannedItemIds: toggleValue(current.bannedItemIds, selectedPreviewItem.id),
                  }));
                }}
                onSaveOverride={applyManualOverride}
              />
            </div>
          </section>
        </div>
      )}

      <ShopAdvancedSheet
        advancedOpen={advancedOpen}
        deleteConfirmOpen={deleteConfirmOpen}
        isSyncing={isSyncing}
        location={location}
        locationRules={locationRules}
        onAdvancedOpenChange={setAdvancedOpen}
        onDeleteConfirmOpenChange={setDeleteConfirmOpen}
        onSyncAllShops={() => void handleSyncAllShops()}
        onToggleShareColumn={handleToggleShareColumn}
        onConfirmDelete={handleDeleteCurrentShop}
      />
    </div>
  );
}
