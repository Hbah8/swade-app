import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ShopRulesEditor } from '@/components/shop-admin/ShopRulesEditor';
import type { ShopRuleConfig } from '@/models/shop';

const baseRules: ShopRuleConfig = {
  includeCategories: [],
  includeTags: [],
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
};

function renderEditor(overrides?: Partial<ComponentProps<typeof ShopRulesEditor>>) {
  return render(
    <ShopRulesEditor
      categories={['firearm', 'tool']}
      tags={['rare', 'military']}
      legalStatuses={['legal', 'illegal']}
      pricingProfiles={[
        {
          id: 'default',
          name: 'Default',
          categoryModifiers: {},
          rounding: 'integer',
        },
      ]}
      legalityMode="any"
      locationRules={baseRules}
      locationNameById={{}}
      catalogItems={[{ id: 'snub', name: 'Snub Revolver' }]}
      exceptionDialogOpen={false}
      exceptionMode="pin"
      onExceptionDialogOpenChange={vi.fn()}
      onExceptionModeChange={vi.fn()}
      onToggleCategory={vi.fn()}
      onToggleIncludeTag={vi.fn()}
      onToggleExcludeTag={vi.fn()}
      onLegalityModeChange={vi.fn()}
      onToggleLegalStatus={vi.fn()}
      onMarkupChange={vi.fn()}
      onPricingProfileChange={vi.fn()}
      onAddException={vi.fn()}
      {...overrides}
    />,
  );
}

describe('ShopRulesEditor visual contracts', () => {
  it('shows explicit empty-state badges for all category/tag pickers', () => {
    renderEditor();

    expect(screen.getAllByText('None selected')).toHaveLength(3);
    expect(screen.getAllByText('Any').length).toBeGreaterThan(0);
  });

  it('renders exceptions as tabbed content instead of nested cards', () => {
    renderEditor();

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Banned' })).toBeInTheDocument();
  });

  it('opens category picker and calls toggle handler when an option is selected', async () => {
    const user = userEvent.setup();
    const onToggleCategory = vi.fn();

    renderEditor({ onToggleCategory });

    await user.click(screen.getByRole('button', { name: 'Select categories' }));
    await user.click(screen.getByText('firearm'));

    expect(onToggleCategory).toHaveBeenCalledWith('firearm');
  });

  it('switches between pinned and banned exception tabs', async () => {
    const user = userEvent.setup();

    renderEditor();

    const pinnedTab = screen.getByRole('tab', { name: 'Pinned' });
    const bannedTab = screen.getByRole('tab', { name: 'Banned' });
    expect(pinnedTab).toHaveAttribute('aria-selected', 'true');

    await user.click(bannedTab);
    expect(bannedTab).toHaveAttribute('aria-selected', 'true');
  });
});
