'use client';

import { Badge } from '@/components/ui/badge';
import type { ListingCondition } from '@/types';

interface ConditionBadgeProps {
  condition: ListingCondition;
}

const conditionLabels: Record<ListingCondition, string> = {
  NEW: 'ახალი',
  LIKE_NEW: 'თითქმის ახალი',
  GOOD: 'კარგი',
  FAIR: 'საშუალო',
  PARTS: 'ნაწილებისთვის',
};

const conditionVariants: Record<ListingCondition, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  NEW: 'default',
  LIKE_NEW: 'default',
  GOOD: 'secondary',
  FAIR: 'outline',
  PARTS: 'destructive',
};

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  return (
    <Badge variant={conditionVariants[condition]}>
      {conditionLabels[condition]}
    </Badge>
  );
}

export { conditionLabels };
