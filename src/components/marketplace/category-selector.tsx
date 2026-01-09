'use client';

import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ListingCategory } from '@/types';

interface CategorySelectorProps {
  categories: ListingCategory[];
  value?: string;
  onSelect: (categoryId: string, categoryName: string) => void;
  placeholder?: string;
  error?: string;
}

export function CategorySelector({
  categories,
  value,
  onSelect,
  placeholder = 'აირჩიეთ კატეგორია',
  error,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Find selected category name
  const getSelectedName = (): string => {
    if (!value) return '';

    for (const category of categories) {
      if (category.id === value) return category.name;
      if (category.children) {
        const child = category.children.find((c) => c.id === value);
        if (child) return `${category.name} / ${child.name}`;
      }
    }
    return '';
  };

  const selectedName = getSelectedName();

  const handleSelect = (categoryId: string, categoryName: string) => {
    onSelect(categoryId, categoryName);
    setOpen(false);
    setExpandedCategory(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            error && 'border-destructive'
          )}
        >
          {selectedName || placeholder}
          <ChevronRight
            className={cn(
              'ml-2 h-4 w-4 shrink-0 transition-transform',
              open && 'rotate-90'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0" align="start">
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {categories.map((category) => (
              <div key={category.id}>
                {/* Parent Category */}
                {category.children && category.children.length > 0 ? (
                  <div>
                    <button
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted',
                        expandedCategory === category.id && 'bg-muted'
                      )}
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.id ? null : category.id
                        )
                      }
                    >
                      <span className="font-medium">{category.name}</span>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          expandedCategory === category.id && 'rotate-90'
                        )}
                      />
                    </button>

                    {/* Child Categories */}
                    {expandedCategory === category.id && (
                      <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                        {category.children.map((child) => (
                          <button
                            key={child.id}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted',
                              value === child.id && 'bg-primary/10 text-primary'
                            )}
                            onClick={() =>
                              handleSelect(
                                child.id,
                                `${category.name} / ${child.name}`
                              )
                            }
                          >
                            <span>{child.name}</span>
                            {value === child.id && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted',
                      value === category.id && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => handleSelect(category.id, category.name)}
                  >
                    <span>{category.name}</span>
                    {value === category.id && <Check className="h-4 w-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
