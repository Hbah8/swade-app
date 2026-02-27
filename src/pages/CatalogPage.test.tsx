import { MemoryRouter } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogPage } from '@/pages/CatalogPage';
import { useShopStore } from '@/store/shopStore';

vi.mock('@/store/shopStore', () => ({
  useShopStore: vi.fn(),
}));

describe('CatalogPage', () => {
  const mockedUseShopStore = vi.mocked(useShopStore);
  let addCatalogItemMock: ReturnType<typeof vi.fn>;
  let importCatalogMock: ReturnType<typeof vi.fn>;
  let syncToServerMock: ReturnType<typeof vi.fn>;
  let syncFromServerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addCatalogItemMock = vi.fn();
    importCatalogMock = vi.fn();
    syncToServerMock = vi.fn().mockResolvedValue(true);
    syncFromServerMock = vi.fn().mockResolvedValue(undefined);
    mockedUseShopStore.mockReturnValue({
      activeSetting: {
        id: 'default-setting',
        name: '70s Vegas',
        catalog: [
          {
            id: 'vegas-snub-revolver',
            name: 'Snub Revolver',
            basePrice: 180,
            weight: 1.1,
            category: 'firearm',
            source: 'built-in',
          },
        ],
        locations: [],
      },
      importCatalog: importCatalogMock,
      addCatalogItem: addCatalogItemMock,
      cloneCatalogItemToCustom: vi.fn(),
      deleteCatalogItem: vi.fn().mockReturnValue(true),
      syncFromServer: syncFromServerMock,
      syncToServer: syncToServerMock,
    } as unknown as ReturnType<typeof useShopStore>);
  });

  it('syncs from server on mount to prevent stale catalog data', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(syncFromServerMock).toHaveBeenCalledTimes(1));
  });

  it('shows destructive alert and disables import when JSON schema is invalid', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Import Pack' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{invalid json' } });
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Schema validation failed for import payload');
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('shows destructive alert when required Add Item fields are missing', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('passes notes when creating a custom item', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.type(screen.getByLabelText('Name'), 'Body Bag');
    await user.type(screen.getByLabelText('Base price'), '55');
    await user.type(screen.getByLabelText('Weight'), '1');
    await user.type(screen.getByLabelText('Notes'), 'For disposal jobs');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(addCatalogItemMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Body Bag',
      notes: 'For disposal jobs',
      source: 'custom',
    }));
  });

  it('syncs to server after importing a valid catalog payload', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Import Pack' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: JSON.stringify({
          schemaVersion: '2.0',
          items: [{ id: 'test-item', name: 'Test Item', basePrice: 10, weight: 1 }],
        }),
      },
    });
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(importCatalogMock).toHaveBeenCalled();
    await waitFor(() => expect(syncToServerMock).toHaveBeenCalledTimes(1));
  });
});
