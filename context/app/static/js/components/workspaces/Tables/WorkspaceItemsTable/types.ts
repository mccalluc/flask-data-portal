import { WorkspaceInvitation, WorkspaceWithUserId } from 'js/components/workspaces/types';
import { SortDirection } from 'js/shared-styles/tables/TableOrdering/TableOrdering';

export type WorkspaceItem = WorkspaceInvitation | WorkspaceWithUserId;

export interface SortField {
  field: string;
  direction: SortDirection;
}

export interface TableField {
  field: string;
  label: string;
}

export interface TableFilter {
  label: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

export interface WorkspaceItemsTableProps<T extends WorkspaceItem> {
  items: T[];
  isLoading: boolean;
  itemType: string;
  filters: TableFilter[];
  tableFields: TableField[];
  initialSortField: SortField;
  toggleItem?: (itemId: string) => void;
  selectedItemIds?: Set<string>;
  showSeeMoreOption?: boolean;
}
