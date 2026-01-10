'use client';

import { useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useListingsStore } from '@/stores';
import { conditionLabels } from './condition-badge';
import type { ListingCategory, ListingCondition, ListingFilters, LocationType } from '@/types';
import { LOCATION_TYPES } from '@/types';

interface ListingFiltersProps {
  categories: ListingCategory[];
  onFiltersChange?: (filters: ListingFilters) => void;
}

const sortOptions = [
  { value: 'newest', label: 'უახლესი' },
  { value: 'oldest', label: 'ძველი' },
  { value: 'price_asc', label: 'ფასი: დაბალიდან' },
  { value: 'price_desc', label: 'ფასი: მაღალიდან' },
  { value: 'popular', label: 'პოპულარული' },
] as const;

const conditions: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS'];

export function ListingFilters({
  categories,
  onFiltersChange,
}: ListingFiltersProps) {
  const { filters, updateFilter, clearFilters } = useListingsStore();

  const handleFilterChange = useCallback(
    <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => {
      updateFilter(key, value);
      onFiltersChange?.({ ...filters, [key]: value });
    },
    [filters, updateFilter, onFiltersChange]
  );

  const handleClearFilters = () => {
    clearFilters();
    onFiltersChange?.({});
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== 'newest'
  ).length;

  // Flatten categories for select
  const flatCategories = categories.flatMap((cat) => [
    cat,
    ...(cat.children || []),
  ]);

  return (
    <div className="flex items-center gap-2">
      {/* Sort - always visible */}
      <Select
        value={filters.sort || 'newest'}
        onValueChange={(value) =>
          handleFilterChange('sort', value as ListingFilters['sort'])
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="სორტირება" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filters Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            ფილტრები
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>ფილტრები</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label>კატეგორია</Label>
              <Select
                value={filters.categoryId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('categoryId', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ კატეგორია" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა კატეგორია</SelectItem>
                  {flatCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.parentId && '— '}
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-2">
              <Label>ფასი (₾)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="მინ"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minPrice',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="მაქს"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxPrice',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Condition */}
            <div className="space-y-2">
              <Label>მდგომარეობა</Label>
              <Select
                value={filters.condition || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'condition',
                    value === 'all' ? undefined : (value as ListingCondition)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ მდგომარეობა" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {conditionLabels[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-2">
              <Label>მდებარეობა</Label>
              <Select
                value={filters.locationType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'locationType',
                    value === 'all' ? undefined : (value as LocationType)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ მდებარეობა" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Brand */}
            <div className="space-y-2">
              <Label>ბრენდი</Label>
              <Input
                placeholder="მაგ: Yamaha"
                value={filters.brand || ''}
                onChange={(e) =>
                  handleFilterChange('brand', e.target.value || undefined)
                }
              />
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              ფილტრების გასუფთავება
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground"
        >
          გასუფთავება
        </Button>
      )}
    </div>
  );
}
