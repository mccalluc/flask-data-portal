import { useMemo, useState } from 'react';
import useEventCallback from '@mui/material/utils/useEventCallback';
import {
  SortField,
  WorkspaceItem,
  WorkspaceItemsTableProps,
} from 'js/components/workspaces/Tables/WorkspaceItemsTable/types';
import { getFieldValue } from 'js/components/workspaces/utils';

function useWorkspaceItemsTable<T extends WorkspaceItem>({
  items,
  initialSortField,
  showSeeMoreOption,
  filters,
  selectedItemIds,
  toggleItem,
}: WorkspaceItemsTableProps<T>) {
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [numVisibleItems, setNumVisibleItems] = useState(showSeeMoreOption ? 3 : items.length);

  const noFiltersSelected = useMemo(() => filters.every(({ show }) => !show), [filters]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aValue = getFieldValue({ item: a, field: sortField.field });
        const bValue = getFieldValue({ item: b, field: sortField.field });

        if (aValue < bValue) return sortField.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortField.direction === 'asc' ? 1 : -1;
        return 0;
      }),
    [items, sortField],
  );

  const onToggleCheckboxHeader = useEventCallback(() => {
    if (!selectedItemIds || !toggleItem) {
      return;
    }

    items.forEach((item) => {
      const itemId = 'id' in item ? item.id.toString() : item.original_workspace_id.id.toString();
      if (selectedItemIds.size === items.length) {
        toggleItem(itemId);
      } else if (!selectedItemIds.has(itemId)) {
        toggleItem(itemId);
      }
    });
  });

  return {
    numVisibleItems,
    setNumVisibleItems,
    noFiltersSelected,
    onToggleCheckboxHeader,
    sortedItems,
    sortField,
    setSortField,
  };
}

export default useWorkspaceItemsTable;
