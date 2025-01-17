'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/UI/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/UI/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/UI/popover';

interface AutoCompleteProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    multiple?: boolean;
    className?: string;
}

export function AutoComplete({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    multiple = false,
    className,
}: AutoCompleteProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (currentValue: string) => {
        if (multiple) {
            const newValue = value.includes(currentValue)
                ? value.filter((v) => v !== currentValue)
                : [...value, currentValue];
            onChange(newValue);
        } else {
            onChange([currentValue]);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between hover:bg-background',
                        value.length > 0 ? 'text-foreground' : 'text-muted-foreground',
                        className
                    )}
                >
                    {value.length > 0
                        ? multiple
                            ? `${value.length} selected`
                            : value[0]
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                        {options.map((option) => (
                            <CommandItem
                                key={option}
                                value={option}
                                onSelect={() => handleSelect(option)}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value.includes(option) ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {option}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
