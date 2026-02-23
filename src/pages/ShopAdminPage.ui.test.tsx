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
      removeLocation: vi.fn(),
      setLocationRules: vi.fn(),
      setLocationShareColumns: vi.fn(),
      syncFromServer: vi.fn().mockResolvedValue(undefined),
      syncLocationToServer: vi.fn().mockResolvedValue(true),
      syncToServer: vi.fn().mockResolvedValue(true),
    } as unknown as ReturnType<typeof useShopStore>);
  });

  it('syncs current shop from primary action', async () => {
    const user = userEvent.setup();
    const syncLocationToServer = vi.fn().mockResolvedValue(true);

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
      removeLocation: vi.fn(),
      setLocationRules: vi.fn(),
      setLocationShareColumns: vi.fn(),
      syncFromServer: vi.fn().mockResolvedValue(undefined),
      syncLocationToServer,
      syncToServer: vi.fn().mockResolvedValue(true),
    } as ReturnType<typeof useShopStore>);

    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Sync current shop' }));

    expect(syncLocationToServer).toHaveBeenCalledWith('downtown');
  });

  it('shows toast status after copying share link', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Copy Link' }));

    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
  });

  it('renders admin split layout controls without tabs', () => {
    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sync current shop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Player View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Link' })).toBeInTheDocument();
    expect(screen.getByText('Live preview')).toBeInTheDocument();
  });

  it('deletes location when Delete shop is clicked', async () => {
    const user = userEvent.setup();
    const removeLocation = vi.fn();

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
      removeLocation,
      setLocationRules: vi.fn(),
      setLocationShareColumns: vi.fn(),
      syncFromServer: vi.fn().mockResolvedValue(undefined),
      syncLocationToServer: vi.fn().mockResolvedValue(true),
      syncToServer: vi.fn().mockResolvedValue(true),
    } as ReturnType<typeof useShopStore>);

    render(
      <MemoryRouter>
        <ShopAdminPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(await screen.findByRole('button', { name: 'Delete shop' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(removeLocation).toHaveBeenCalledWith('downtown');
  });
});
