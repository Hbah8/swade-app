import { describe, expect, it } from 'vitest'

import {
  calculateLocationPrice,
  buildLocationShopView,
  parseEquipmentCatalog,
} from '@/services/shopService'

describe('shopService', () => {
  it('applies location percentage markup when no manual override exists', () => {
    const price = calculateLocationPrice({
      basePrice: 100,
      percentMarkup: 25,
      manualOverride: undefined,
    })

    expect(price).toBe(125)
  })

  it('uses manual override price when provided', () => {
    const price = calculateLocationPrice({
      basePrice: 100,
      percentMarkup: 25,
      manualOverride: 80,
    })

    expect(price).toBe(80)
  })

  it('builds a location shop view with filtered availability and computed prices', () => {
    const view = buildLocationShopView({
      location: {
        id: 'riverfall',
        name: 'Riverfall',
        availableItemIds: ['rope', 'torch'],
        percentMarkup: 10,
        manualPrices: { torch: 12 },
      },
      catalog: [
        { id: 'rope', name: 'Rope', basePrice: 10, weight: 1, category: 'Gear', notes: 'Climbing aid' },
        { id: 'torch', name: 'Torch', basePrice: 5, weight: 0.5, category: 'Gear', notes: 'Provides light' },
        { id: 'sword', name: 'Sword', basePrice: 200, weight: 8 },
      ],
    })

    expect(view.locationName).toBe('Riverfall')
    expect(view.items).toEqual([
      {
        id: 'rope',
        name: 'Rope',
        basePrice: 10,
        finalPrice: 11,
        weight: 1,
        category: 'Gear',
        notes: 'Climbing aid',
      },
      {
        id: 'torch',
        name: 'Torch',
        basePrice: 5,
        finalPrice: 12,
        weight: 0.5,
        category: 'Gear',
        notes: 'Provides light',
      },
    ])
  })

  it('shows full catalog when availableItemIds is empty', () => {
    const view = buildLocationShopView({
      location: {
        id: 'riverfall',
        name: 'Riverfall',
        availableItemIds: [],
        percentMarkup: 10,
        manualPrices: {},
      },
      catalog: [
        { id: 'rope', name: 'Rope', basePrice: 10, weight: 1 },
        { id: 'torch', name: 'Torch', basePrice: 5, weight: 0.5 },
      ],
    })

    expect(view.items).toEqual([
      { id: 'rope', name: 'Rope', basePrice: 10, finalPrice: 11, weight: 1 },
      { id: 'torch', name: 'Torch', basePrice: 5, finalPrice: 6, weight: 0.5 },
    ])
  })

  it('parses and validates a JSON equipment catalog payload', () => {
    const parsed = parseEquipmentCatalog(
      JSON.stringify({
        schemaVersion: '1.0',
        items: [
          { id: 'bedroll', name: 'Bedroll', basePrice: 15, weight: 2 },
        ],
      }),
    )

    expect(parsed.schemaVersion).toBe('1.0')
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0]?.id).toBe('bedroll')
  })
})
