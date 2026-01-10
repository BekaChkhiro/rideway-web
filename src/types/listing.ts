// Listing Types

import type { UserCard } from './user';

export type ListingType = 'MOTORCYCLE' | 'PARTS' | 'EQUIPMENT' | 'ACCESSORIES';
export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'PARTS';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'RESERVED' | 'EXPIRED';

// Motorcycle-specific types
export type MotorcycleCategory = 'MOPED' | 'CITY' | 'SPORT' | 'TOURING' | 'OFF_ROAD' | 'CRUISER';
export type CustomsStatus = 'CLEARED' | 'NOT_CLEARED';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type LocationType = 'ON_THE_WAY' | 'GEORGIA' | 'ABROAD';

// Motorcycle categories config
export const MOTORCYCLE_CATEGORIES = [
  { value: 'MOPED' as MotorcycleCategory, label: 'მოპედი' },
  { value: 'CITY' as MotorcycleCategory, label: 'ქალაქი' },
  { value: 'SPORT' as MotorcycleCategory, label: 'სპორტული' },
  { value: 'TOURING' as MotorcycleCategory, label: 'სამგზავრო' },
  { value: 'OFF_ROAD' as MotorcycleCategory, label: 'OFF-ROAD' },
  { value: 'CRUISER' as MotorcycleCategory, label: 'კრუიზერი' },
] as const;

// Customs status config
export const CUSTOMS_STATUSES = [
  { value: 'CLEARED' as CustomsStatus, label: 'განბაჟებული' },
  { value: 'NOT_CLEARED' as CustomsStatus, label: 'განუბაჟებელი' },
] as const;

// Transmission config
export const TRANSMISSIONS = [
  { value: 'MANUAL' as Transmission, label: 'მექანიკა' },
  { value: 'AUTOMATIC' as Transmission, label: 'ავტომატიკა' },
] as const;

// Location config
export const LOCATION_TYPES = [
  { value: 'ON_THE_WAY' as LocationType, label: 'გზაში საქ.-სკენ' },
  { value: 'GEORGIA' as LocationType, label: 'საქართველო' },
  { value: 'ABROAD' as LocationType, label: 'საზღვარგარეთ' },
] as const;

// Georgian cities
export const GEORGIAN_CITIES = [
  'თბილისი',
  'ბათუმი',
  'ქუთაისი',
  'რუსთავი',
  'გორი',
  'ზუგდიდი',
  'ფოთი',
  'ხაშური',
  'სამტრედია',
  'სენაკი',
  'ზესტაფონი',
  'თელავი',
  'ახალციხე',
  'ოზურგეთი',
  'კასპი',
  'ჭიათურა',
  'წყალტუბო',
  'საგარეჯო',
  'გარდაბანი',
  'ბორჯომი',
  'ტყიბული',
  'ხონი',
  'მარნეული',
  'ბოლნისი',
  'დუშეთი',
  'სხვა',
] as const;

// Countries abroad
export const ABROAD_COUNTRIES = [
  'აშშ',
  'გერმანია',
  'იაპონია',
  'იტალია',
  'საფრანგეთი',
  'დიდი ბრიტანეთი',
  'ესპანეთი',
  'ნიდერლანდები',
  'ბელგია',
  'ავსტრია',
  'შვეიცარია',
  'პოლონეთი',
  'ჩეხეთი',
  'თურქეთი',
  'არაბეთის გაერთიანებული საამიროები',
  'სხვა',
] as const;

// Listing type configuration
export const LISTING_TYPES = [
  { value: 'MOTORCYCLE' as ListingType, label: 'მოტოციკლები', slug: 'motorcycles' },
  { value: 'PARTS' as ListingType, label: 'ნაწილები', slug: 'parts' },
  { value: 'EQUIPMENT' as ListingType, label: 'ეკიპირება', slug: 'equipment' },
  { value: 'ACCESSORIES' as ListingType, label: 'აქსესუარები', slug: 'accessories' },
] as const;

export function getListingTypeFromSlug(slug: string): ListingType | null {
  const found = LISTING_TYPES.find((t) => t.slug === slug);
  return found?.value ?? null;
}

export function getSlugFromListingType(type: ListingType): string {
  const found = LISTING_TYPES.find((t) => t.value === type);
  return found?.slug ?? 'motorcycles';
}

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  children?: ListingCategory[];
  listingsCount?: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ListingType;
  condition: ListingCondition;
  status: ListingStatus;
  images: ListingImage[];
  category: ListingCategory;
  seller: UserCard;
  viewsCount: number;
  favoritesCount: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;

  // Common optional fields
  brand: string | null;
  model: string | null;
  year: number | null;

  // Location fields
  locationType: LocationType | null;
  locationCity: string | null;

  // Motorcycle-specific fields
  motorcycleCategory: MotorcycleCategory | null;
  customsStatus: CustomsStatus | null;
  engineCC: number | null;
  mileage: number | null;
  transmission: Transmission | null;
}

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  type: ListingType;
  condition: ListingCondition;
  categoryId: string;
  images?: File[];

  // Common optional fields
  brand?: string;
  model?: string;
  year?: number;

  // Location fields
  locationType?: LocationType;
  locationCity?: string;

  // Motorcycle-specific fields
  motorcycleCategory?: MotorcycleCategory;
  customsStatus?: CustomsStatus;
  engineCC?: number;
  mileage?: number;
  transmission?: Transmission;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  condition?: ListingCondition;
  categoryId?: string;
  brand?: string;
  model?: string;
  year?: number;
  locationType?: LocationType;
  locationCity?: string;
  motorcycleCategory?: MotorcycleCategory;
  customsStatus?: CustomsStatus;
  engineCC?: number;
  mileage?: number;
  transmission?: Transmission;
}

export interface ListingFilters {
  type?: ListingType;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  brand?: string;
  status?: ListingStatus;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';
  // Motorcycle filters
  motorcycleCategory?: MotorcycleCategory;
  customsStatus?: CustomsStatus;
  locationType?: LocationType;
  minYear?: number;
  maxYear?: number;
  minEngineCC?: number;
  maxEngineCC?: number;
  transmission?: Transmission;
}
