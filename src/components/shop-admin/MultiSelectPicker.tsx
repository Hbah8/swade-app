import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

const MAX_VISIBLE_SELECTIONS = 2;

interface MultiSelectPickerProps {
  label: string;
  triggerLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyStateBadgeLabel?: string;
}

/**
 * Renders a searchable multi-select picker with badge summary of current selections.
 * Shows an explicit empty-state badge when nothing is selected.
 */
export function MultiSelectPicker({
  label,
  triggerLabel,
  searchPlaceholder,
  emptyText,
  options,
  selected,
  onToggle,
  emptyStateBadgeLabel,
}: MultiSelectPickerProps) {
  const visibleSelections = selected.slice(0, MAX_VISIBLE_SELECTIONS);
  const hiddenSelectionCount = selected.length - visibleSelections.length;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span>{triggerLabel}</span>
            <ChevronDown className="size-4 opacity-70" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option} onSelect={() => onToggle(option)}>
                    <Checkbox checked={selected.includes(option)} />
                    <span>{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="min-h-6 flex flex-wrap items-center gap-1">
        {selected.length === 0 ? (
          <Badge variant="secondary">{emptyStateBadgeLabel ?? 'None selected'}</Badge>
        ) : (
          visibleSelections.map((value) => (
            <Badge key={value} variant="secondary">
              {value}
            </Badge>
          ))
        )}
        {hiddenSelectionCount > 0 ? <Badge variant="outline">+{hiddenSelectionCount}</Badge> : null}
      </div>
    </div>
  );
}
