'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ options, value, onChange, placeholder = 'Select items' }: MultiSelectProps) {
  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(', ');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' role='combobox' className='w-full justify-between'>
          {selectedLabels || placeholder}
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandEmpty>No result.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleValue(option.value)}
                  className='flex items-center justify-between'
                >
                  {option.label}
                  {isSelected && <Check className='h-4 w-4' />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
