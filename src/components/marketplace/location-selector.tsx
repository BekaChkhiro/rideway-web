'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  LOCATION_TYPES,
  GEORGIAN_CITIES,
  ABROAD_COUNTRIES,
  type LocationType,
} from '@/types';

interface LocationSelectorProps {
  locationType?: LocationType;
  locationCity?: string;
  onLocationTypeChange: (type: LocationType) => void;
  onLocationCityChange: (city: string) => void;
  error?: string;
}

export function LocationSelector({
  locationType,
  locationCity,
  onLocationTypeChange,
  onLocationCityChange,
  error,
}: LocationSelectorProps) {
  const [showCitySelect, setShowCitySelect] = useState(false);

  useEffect(() => {
    setShowCitySelect(locationType === 'GEORGIA' || locationType === 'ABROAD');
  }, [locationType]);

  const handleTypeChange = (value: LocationType) => {
    onLocationTypeChange(value);
    // Reset city when type changes
    if (value === 'ON_THE_WAY') {
      onLocationCityChange('');
    }
  };

  const getCityOptions = () => {
    if (locationType === 'GEORGIA') {
      return GEORGIAN_CITIES;
    }
    if (locationType === 'ABROAD') {
      return ABROAD_COUNTRIES;
    }
    return [];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>მდებარეობის ტიპი *</Label>
        <Select value={locationType} onValueChange={handleTypeChange}>
          <SelectTrigger className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder="აირჩიეთ მდებარეობა" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {showCitySelect && (
        <div className="space-y-2">
          <Label>
            {locationType === 'GEORGIA' ? 'ქალაქი *' : 'ქვეყანა *'}
          </Label>
          <Select value={locationCity} onValueChange={onLocationCityChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  locationType === 'GEORGIA' ? 'აირჩიეთ ქალაქი' : 'აირჩიეთ ქვეყანა'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {getCityOptions().map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
