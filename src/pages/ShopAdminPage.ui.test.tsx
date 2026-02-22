import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShopAdminPage } from '@/pages/ShopAdminPage';
import { useShopStore } from '@/store/shopStore';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/store/shopStore', () => ({
  useShopStore: vi.fn(),
}));

describe('ShopAdminPage UI contracts', () => {
  const mockedUseShopStore = vi.mocked(useShopStore);

  beforeEach(() => {
    navigateMock.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    mockedUseShopStore.mockReturnValue({
      activeSetting: {
        id: 'default-setting',
        name: '70s Vegas',
        catalog: [
          {
            id: 'snub',
            name: 'Snub Revolver',
            basePrice: 180,
            weight: 1,
            category: 'firearm',
          },
        ],
        locations: [
          {
            id: 'downtown',
            name: 'Downtown',
            availableItemIds: [],
            percentMarkup: 0,
            manualPrices: {},
            rules: {
              includeCategories: [],
              includeTags: ['firearm'],
              excludeTags: [],
              legalStatuses: [],
              markupPercent: 0,
              pricingProfile: {
                id: 'default',
                name: 'Default',
                categoryModifiers: {},
                rounding: 'integer',
              },
              pinnedItemIds: [],
              bannedItemIds: [],
              manualPriceOverrides: {},
            },
            shareColumns: ['name', 'category', 'finalPrice', 'weight'],
          },
        ],
      },
      syncError: null,
      isSyncing: false,
      addLocation: vi.fn(),
      setLocationRules: vi.fn(),
      setLocationShareColumns: vi.fn(),
      syncFromServer: vi.fn().mockResolvedValue(undefined),
      syncToServer: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useShopStore>);
  });

  it('shows blocking metadata alert with CTA to catalog health', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Rule filters require missing metadata');

    await user.click(screen.getByRole('button', { name: 'Open Catalog Health' }));
    expect(navigateMock).toHaveBeenCalledWith('/catalog?tab=Health');
  });

  it('shows toast status after copying share link', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('tab', { name: 'Share' }));
    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
  });
});
