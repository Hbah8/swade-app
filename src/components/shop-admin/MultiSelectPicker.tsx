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

interface MultiSelectPickerProps {
  label: string;
  triggerLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  fallbackBadgeLabel?: string;
}

export function MultiSelectPicker({
  label,
  triggerLabel,
  searchPlaceholder,
  emptyText,
  options,
  selected,
  onToggle,
  fallbackBadgeLabel,
}: MultiSelectPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline">
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
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
      <div className="flex flex-wrap gap-1">
        {selected.length === 0 && fallbackBadgeLabel ? (
          <Badge variant="outline">{fallbackBadgeLabel}</Badge>
        ) : (
          selected.map((value) => (
            <Badge key={value} variant="secondary">
              {value}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
