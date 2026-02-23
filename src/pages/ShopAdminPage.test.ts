import { describe, expect, it, vi } from 'vitest';

import { openPlayerView } from '@/pages/shopAdmin.helpers';

describe('openPlayerView', () => {
  it('navigates to player view after successful sync', async () => {
    const syncLocationToServer = vi.fn<(locationId: string) => Promise<boolean>>().mockResolvedValue(true);
    const navigate = vi.fn<(to: string) => void>();

    await openPlayerView(syncLocationToServer, navigate, 'downtown');

    expect(syncLocationToServer).toHaveBeenCalledWith('downtown');
    expect(navigate).toHaveBeenCalledWith('/shop/downtown');
  });

  it('does not navigate when sync fails', async () => {
    const syncLocationToServer = vi.fn<(locationId: string) => Promise<boolean>>().mockResolvedValue(false);
    const navigate = vi.fn<(to: string) => void>();

    await openPlayerView(syncLocationToServer, navigate, 'downtown');

    expect(syncLocationToServer).toHaveBeenCalledWith('downtown');
    expect(navigate).not.toHaveBeenCalled();
  });
});
