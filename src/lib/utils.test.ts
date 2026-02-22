import { describe, expect, it } from 'vitest';

import { createId } from '@/lib/utils';

describe('createId', () => {
  it('uses randomUUID when available', () => {
    const cryptoStub = {
      randomUUID: () => 'uuid-from-randomUUID',
      getRandomValues: () => {
        throw new Error('should not be called when randomUUID exists');
      },
    } as unknown as Crypto;

    expect(createId(cryptoStub)).toBe('uuid-from-randomUUID');
  });

  it('falls back when randomUUID is unavailable', () => {
    const cryptoStub = {
      getRandomValues: (array: Uint8Array) => {
        array.fill(0xab);
        return array;
      },
    } as unknown as Crypto;

    const id = createId(cryptoStub);

    expect(id).toBeTypeOf('string');
    expect(id.length).toBeGreaterThan(0);
  });
});
