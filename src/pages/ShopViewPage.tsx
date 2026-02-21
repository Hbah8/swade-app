import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { LocationShopView } from '@/models/shop';

export function ShopViewPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const [view, setView] = useState<LocationShopView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!locationId) {
      setError('Missing location id');
      return;
    }

    const abortController = new AbortController();

    const loadShop = async () => {
      try {
        const response = await fetch(`/api/shop/${locationId}`, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = (await response.json()) as LocationShopView;
        setView(data);
        setError(null);
      } catch (loadError) {
        if (abortController.signal.aborted) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : 'Unable to load shop data';
        setError(message);
      }
    };

    void loadShop();
    return () => abortController.abort();
  }, [locationId]);

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-swade-gold">Shop</h1>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (!view) {
    return <p className="text-sm text-swade-text-muted">Loading shop...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-swade-gold">{view.locationName} Shop</h1>
      <p className="text-sm text-swade-text-muted">Read-only player view.</p>

      <div className="space-y-2">
        {view.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-swade-surface-light bg-swade-surface px-3 py-2"
          >
            <span className="text-sm text-swade-text">{item.name}</span>
            <span className="text-xs text-swade-text-muted">Base: {item.basePrice}</span>
            <span className="text-sm font-semibold text-swade-gold-light">{item.finalPrice}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
