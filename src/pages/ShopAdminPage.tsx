import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { parseEquipmentCatalog } from '@/services/shopService';
import { useShopStore } from '@/store/shopStore';

export function ShopAdminPage() {
  const {
    campaign,
    syncError,
    isSyncing,
    addLocation,
    importCatalog,
    setLocationMarkup,
    setLocationManualPrice,
    toggleItemAvailability,
    syncFromServer,
    syncToServer,
  } = useShopStore();

  const [newLocationName, setNewLocationName] = useState('');
  const [catalogInput, setCatalogInput] = useState('');

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  const sortedCatalog = useMemo(
    () => [...campaign.catalog].sort((first, second) => first.name.localeCompare(second.name)),
    [campaign.catalog],
  );

  const handleImportCatalog = () => {
    try {
      const parsed = parseEquipmentCatalog(catalogInput);
      importCatalog(parsed.items);
    } catch {
      alert('Catalog JSON is invalid. Please verify schemaVersion and items.');
    }
  };

  const handleCreateLocation = () => {
    addLocation(newLocationName);
    setNewLocationName('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-swade-gold">Shop Manager</h1>
      <p className="text-sm text-swade-text-muted">
        Manage location inventories and pricing rules, then share short LAN links with players.
      </p>

      {syncError && (
        <div className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          Sync issue: {syncError}
        </div>
      )}

      <section className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
        <h2 className="text-sm font-semibold text-swade-gold-light">1) Import Catalog JSON</h2>
        <textarea
          value={catalogInput}
          onChange={(event) => setCatalogInput(event.target.value)}
          rows={8}
          placeholder="Paste catalog JSON with schemaVersion + items"
          className="w-full rounded-lg border border-swade-surface-light bg-swade-bg px-3 py-2 text-sm text-swade-text focus:border-swade-gold/50 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleImportCatalog}
            className="rounded-lg bg-swade-gold px-3 py-2 text-xs font-semibold text-black"
          >
            Import Catalog
          </button>
          <button
            type="button"
            onClick={() => void syncToServer()}
            disabled={isSyncing}
            className="rounded-lg border border-swade-surface-light px-3 py-2 text-xs text-swade-text"
          >
            Save to LAN Server
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
        <h2 className="text-sm font-semibold text-swade-gold-light">2) Create Location</h2>
        <div className="flex gap-2">
          <input
            value={newLocationName}
            onChange={(event) => setNewLocationName(event.target.value)}
            placeholder="Location name"
            className="w-full rounded-lg border border-swade-surface-light bg-swade-bg px-3 py-2 text-sm text-swade-text focus:border-swade-gold/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreateLocation}
            className="rounded-lg bg-swade-gold px-3 py-2 text-xs font-semibold text-black"
          >
            Add
          </button>
        </div>
      </section>

      {campaign.locations.map((location) => (
        <section key={location.id} className="space-y-3 rounded-lg border border-swade-surface-light bg-swade-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-swade-gold-light">{location.name}</h3>
            <Link
              to={`/shop/${location.id}`}
              className="rounded-lg border border-swade-surface-light px-3 py-1 text-xs text-swade-text"
            >
              Player View
            </Link>
          </div>

          <label className="block text-xs text-swade-text-muted">
            Percent markup
            <input
              type="number"
              value={location.percentMarkup}
              onChange={(event) => setLocationMarkup(location.id, Number(event.target.value || 0))}
              className="mt-1 w-full rounded-lg border border-swade-surface-light bg-swade-bg px-3 py-2 text-sm text-swade-text"
            />
          </label>

          <div className="space-y-2">
            {sortedCatalog.map((item) => {
              const available = location.availableItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-swade-surface-light px-3 py-2 sm:grid-cols-[1fr_120px_130px] sm:items-center"
                >
                  <button
                    type="button"
                    onClick={() => toggleItemAvailability(location.id, item.id)}
                    className={`rounded px-2 py-1 text-left text-xs ${
                      available ? 'bg-swade-gold/20 text-swade-gold-light' : 'bg-swade-bg text-swade-text-muted'
                    }`}
                  >
                    {available ? '✓ ' : ''}
                    {item.name} (base {item.basePrice})
                  </button>

                  <span className="text-xs text-swade-text-muted">Weight: {item.weight}</span>

                  <input
                    type="number"
                    value={location.manualPrices[item.id] ?? ''}
                    placeholder="Manual price"
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) {
                        setLocationManualPrice(location.id, item.id, 0);
                        return;
                      }
                      setLocationManualPrice(location.id, item.id, Number(value));
                    }}
                    className="rounded-lg border border-swade-surface-light bg-swade-bg px-2 py-1 text-xs text-swade-text"
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
