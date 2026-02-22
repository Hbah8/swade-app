import { describe, expect, it, vi } from 'vitest';

import { copyTextToClipboard } from '@/pages/shopAdmin.helpers';

describe('shopAdmin helpers', () => {
  it('returns true when Clipboard API succeeds', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const result = await copyTextToClipboard('http://localhost/shop/downtown');

    expect(result).toBe(true);
  });

  it('falls back to document copy when Clipboard API fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('clipboard denied')),
      },
    });

    if (typeof document.execCommand !== 'function') {
      Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: vi.fn().mockReturnValue(true),
      });
    }

    const execSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);

    const result = await copyTextToClipboard('http://localhost/shop/downtown');

    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);
  });
});
