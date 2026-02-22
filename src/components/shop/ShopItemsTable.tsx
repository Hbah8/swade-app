import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type FilterFn,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { LocationShopViewItem } from '@/models/shop';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const nameFilter: FilterFn<LocationShopViewItem> = (row, columnId, value) => {
  const query = String(value ?? '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  const itemName = String(row.getValue(columnId)).toLowerCase();
  return itemName.includes(query);
};

const categoryFilter: FilterFn<LocationShopViewItem> = (row, columnId, value) => {
  const category = String(value ?? '').trim().toLowerCase();
  if (!category || category === 'all') {
    return true;
  }

  const itemCategory = String(row.getValue(columnId) ?? '').toLowerCase();
  return itemCategory === category;
};

const notesFilter: FilterFn<LocationShopViewItem> = (row, columnId, value) => {
  const query = String(value ?? '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  const notes = String(row.getValue(columnId) ?? '').toLowerCase();
  return notes.includes(query);
};

const priceRangeFilter: FilterFn<LocationShopViewItem> = (row, columnId, value) => {
  const range = value as { minPrice?: number; maxPrice?: number };
  const price = Number(row.getValue(columnId));

  if (Number.isNaN(price)) {
    return false;
  }

  const minMatch = typeof range?.minPrice !== 'number' || price >= range.minPrice;
  const maxMatch = typeof range?.maxPrice !== 'number' || price <= range.maxPrice;
  return minMatch && maxMatch;
};

const columns: ColumnDef<LocationShopViewItem>[] = [
  {
    accessorKey: 'name',
    header: 'Название',
    filterFn: nameFilter,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="min-w-[220px]">
          <p className="font-medium text-swade-text">{item.name}</p>
          {item.category && <p className="text-xs text-swade-text-muted sm:hidden">{item.category}</p>}
          {item.notes && <p className="text-xs text-swade-text-muted sm:hidden">{item.notes}</p>}
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    filterFn: categoryFilter,
    cell: ({ row }) => <span className="text-swade-text-muted">{row.original.category ?? '—'}</span>,
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    accessorKey: 'notes',
    header: 'Особенности',
    filterFn: notesFilter,
    cell: ({ row }) => (
      <span className="max-w-xl whitespace-normal break-words text-xs text-swade-text-muted">{row.original.notes ?? '—'}</span>
    ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    accessorKey: 'finalPrice',
    header: 'Цена',
    filterFn: priceRangeFilter,
    cell: ({ row }) => <span className="font-semibold text-swade-gold-light">{row.original.finalPrice}</span>,
  },
  {
    accessorKey: 'weight',
    header: 'Вес',
    cell: ({ row }) => <span className="text-swade-text-muted">{row.original.weight}</span>,
  },
];

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

export function ShopItemsTable({ items }: { items: LocationShopViewItem[] }) {
  const [nameQuery, setNameQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [notesQuery, setNotesQuery] = useState('');
  const [minPriceRaw, setMinPriceRaw] = useState('');
  const [maxPriceRaw, setMaxPriceRaw] = useState('');

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value)))).sort(
        (first, second) => first.localeCompare(second),
      ),
    [items],
  );

  const minPrice = parseOptionalNumber(minPriceRaw);
  const maxPrice = parseOptionalNumber(maxPriceRaw);

  const columnFilters = useMemo(
    () => [
      { id: 'name', value: nameQuery },
      { id: 'category', value: category },
      { id: 'notes', value: notesQuery },
      { id: 'finalPrice', value: { minPrice, maxPrice } },
    ],
    [category, maxPrice, minPrice, nameQuery, notesQuery],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          value={nameQuery}
          onChange={(event) => setNameQuery(event.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full" aria-label="Фильтр по категории">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={notesQuery}
          onChange={(event) => setNotesQuery(event.target.value)}
          placeholder="Поиск по особенностям"
          aria-label="Поиск по особенностям"
        />

        <Input
          type="number"
          value={minPriceRaw}
          onChange={(event) => setMinPriceRaw(event.target.value)}
          placeholder="Цена от"
          aria-label="Минимальная цена"
        />

        <Input
          type="number"
          value={maxPriceRaw}
          onChange={(event) => setMaxPriceRaw(event.target.value)}
          placeholder="Цена до"
          aria-label="Максимальная цена"
        />
      </div>

      <Table aria-label="Список товаров магазина с фильтрами по названию, категории, особенностям и цене">
        <TableCaption className="sr-only">Список товаров магазина</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const className = (header.column.columnDef.meta as { className?: string } | undefined)?.className;
                return (
                  <TableHead key={header.id} className={className}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-20 text-center text-swade-text-muted">
                Ничего не найдено по заданным фильтрам.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const className = (cell.column.columnDef.meta as { className?: string } | undefined)?.className;
                  return (
                    <TableCell key={cell.id} className={className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
