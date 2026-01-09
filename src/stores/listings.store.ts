import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ListingFilters, ListingCategory } from '@/types';

type ViewMode = 'grid' | 'list';

interface ListingsState {
  viewMode: ViewMode;
  filters: ListingFilters;
  categories: ListingCategory[];
  searchQuery: string;
}

interface ListingsActions {
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: ListingFilters) => void;
  updateFilter: <K extends keyof ListingFilters>(
    key: K,
    value: ListingFilters[K]
  ) => void;
  clearFilters: () => void;
  setCategories: (categories: ListingCategory[]) => void;
  setSearchQuery: (query: string) => void;
}

type ListingsStore = ListingsState & ListingsActions;

const defaultFilters: ListingFilters = {
  sort: 'newest',
};

export const useListingsStore = create<ListingsStore>()(
  persist(
    (set) => ({
      // State
      viewMode: 'grid',
      filters: defaultFilters,
      categories: [],
      searchQuery: '',

      // Actions
      setViewMode: (mode) => set({ viewMode: mode }),

      setFilters: (filters) => set({ filters }),

      updateFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilters: () => set({ filters: defaultFilters, searchQuery: '' }),

      setCategories: (categories) => set({ categories }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'listings-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);
