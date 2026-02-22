import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { LocationShopViewItem } from '@/models/shop';
import { ShopItemsTable } from '@/components/shop/ShopItemsTable';
import { filterShopItems } from '@/components/shop/shopItemFilters';

const ITEMS: LocationShopViewItem[] = [
  {
    id: 'revolver-police-38',
    name: 'Полицейский револьвер (.38)',
    basePrice: 150,
    finalPrice: 150,
    weight: 1,
    category: 'Револьвер',
    notes: 'Урон 2d6, СКС 1',
  },
  {
    id: 'pistol-colt-1911',
    name: 'Кольт 1911 (.45)',
    basePrice: 200,
    finalPrice: 220,
    weight: 1.5,
    category: 'Пистолет',
    notes: 'Урон 2d6+1, ББ 1',
  },
  {
    id: 'gear-rope',
    name: 'Канат',
    basePrice: 10,
    finalPrice: 11,
    weight: 2,
    category: 'Снаряжение',
    notes: 'Полезен для лазания',
  },
];

describe('filterShopItems', () => {
  it('filters by name, category, notes and price range together', () => {
    const filtered = filterShopItems(ITEMS, {
      nameQuery: 'кольт',
      category: 'Пистолет',
      notesQuery: 'бб',
      minPrice: 200,
      maxPrice: 250,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('pistol-colt-1911');
  });

  it('returns all items when filters are empty', () => {
    const filtered = filterShopItems(ITEMS, {
      nameQuery: '',
      category: 'all',
      notesQuery: '',
      minPrice: undefined,
      maxPrice: undefined,
    });

    expect(filtered).toHaveLength(3);
  });
});

describe('ShopItemsTable', () => {
  it('renders required columns for player readability', () => {
    render(<ShopItemsTable items={ITEMS} />);

    expect(screen.getByText('Название')).toBeInTheDocument();
    expect(screen.getByText('Категория')).toBeInTheDocument();
    expect(screen.getByText('Особенности')).toBeInTheDocument();
    expect(screen.getByText('Цена')).toBeInTheDocument();
    expect(screen.getByText('Вес')).toBeInTheDocument();
  });

  it('exposes table accessibility label', () => {
    render(<ShopItemsTable items={ITEMS} />);

    expect(
      screen.getByLabelText('Список товаров магазина с фильтрами по названию, категории, особенностям и цене'),
    ).toBeInTheDocument();
  });

  it('filters rows by name query', async () => {
    const user = userEvent.setup();
    render(<ShopItemsTable items={ITEMS} />);

    expect(screen.getByText('Полицейский револьвер (.38)')).toBeInTheDocument();
    expect(screen.getByText('Кольт 1911 (.45)')).toBeInTheDocument();
    expect(screen.getByText('Канат')).toBeInTheDocument();

    const input = screen.getByLabelText('Поиск по названию');
    await user.type(input, 'кольт');

    expect(screen.queryByText('Полицейский револьвер (.38)')).not.toBeInTheDocument();
    expect(screen.getByText('Кольт 1911 (.45)')).toBeInTheDocument();
    expect(screen.queryByText('Канат')).not.toBeInTheDocument();
  });

  it('filters rows by notes query (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<ShopItemsTable items={ITEMS} />);

    const input = screen.getByLabelText('Поиск по особенностям');
    await user.type(input, 'бб');

    expect(screen.queryByText('Полицейский револьвер (.38)')).not.toBeInTheDocument();
    expect(screen.getByText('Кольт 1911 (.45)')).toBeInTheDocument();
    expect(screen.queryByText('Канат')).not.toBeInTheDocument();
  });

  it('filters rows by price range', async () => {
    const user = userEvent.setup();
    render(<ShopItemsTable items={ITEMS} />);

    const minPriceInput = screen.getByLabelText('Минимальная цена');
    await user.type(minPriceInput, '200');

    expect(screen.queryByText('Полицейский револьвер (.38)')).not.toBeInTheDocument();
    expect(screen.getByText('Кольт 1911 (.45)')).toBeInTheDocument();
    expect(screen.queryByText('Канат')).not.toBeInTheDocument();
  });

  it('shows empty state message when filters exclude all rows', async () => {
    const user = userEvent.setup();
    render(<ShopItemsTable items={ITEMS} />);

    const input = screen.getByLabelText('Поиск по названию');
    await user.type(input, 'не существует');

    expect(screen.getByText('Ничего не найдено по заданным фильтрам.')).toBeInTheDocument();
  });
});
