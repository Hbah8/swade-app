import { describe, expect, it, vi } from 'vitest';

import { openPlayerView } from '@/pages/shopAdmin.helpers';

describe('openPlayerView', () => {
  it('navigates to player view after successful sync', async () => {
    const syncToServer = vi.fn<() => Promise<boolean>>().mockResolvedValue(true);
    const navigate = vi.fn<(to: string) => void>();

    await openPlayerView(syncToServer, navigate, 'downtown');

    expect(syncToServer).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/shop/downtown');
  });

  it('does not navigate when sync fails', async () => {
    const syncToServer = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);
    const navigate = vi.fn<(to: string) => void>();

    await openPlayerView(syncToServer, navigate, 'downtown');

    expect(syncToServer).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
