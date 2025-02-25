import React from 'react';
import { ArrowDownOff, ArrowDownOn, ArrowUpOn } from './style';

export type SortDirection = 'asc' | 'desc';

function OrderIcon({ direction, isCurrentSortField }: { direction: SortDirection; isCurrentSortField: boolean }) {
  if (!isCurrentSortField) return <ArrowDownOff />;
  if (direction === 'asc') return <ArrowUpOn />;
  if (direction === 'desc') return <ArrowDownOn />;
}

function getSortOrder({ direction, isCurrentSortField }: { direction: SortDirection; isCurrentSortField: boolean }) {
  if (!isCurrentSortField) {
    return 'desc';
  }

  return direction === 'desc' ? 'asc' : 'desc';
}

export { OrderIcon, getSortOrder };
