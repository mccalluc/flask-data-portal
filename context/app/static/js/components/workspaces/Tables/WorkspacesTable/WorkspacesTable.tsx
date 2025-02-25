import React from 'react';
import Stack from '@mui/material/Stack';
import { WorkspaceWithUserId } from 'js/components/workspaces/types';
import Description from 'js/shared-styles/sections/Description';
import WorkspaceItemsTable from 'js/components/workspaces/Tables/WorkspaceItemsTable/WorkspaceItemsTable';
import { SortField, TableField } from 'js/components/workspaces/Tables/WorkspaceItemsTable/types';
import { StyledNumSelectedHeader } from 'js/components/workspaces/Tables/WorkspaceItemsTable/style';
import useWorkspacesTable from 'js/components/workspaces/Tables/WorkspacesTable/hooks';

const tableFields: TableField[] = [
  {
    field: 'name',
    label: 'Name',
  },
  {
    field: 'status',
    label: 'Status',
  },
  {
    field: 'user_id.username',
    label: 'Created By',
  },
  {
    field: 'datetime_last_job_launch',
    label: 'Last Launched',
  },
];

const initialSortField: SortField = {
  direction: 'desc',
  field: 'datetime_last_job_launch',
};

export default function WorkspacesTable({
  workspacesList,
  selectedItems,
  isLoading,
  toggleItem,
}: {
  workspacesList: WorkspaceWithUserId[];
  selectedItems: Set<string>;
  isLoading: boolean;
  toggleItem: (item: string) => void;
}) {
  const { filteredWorkspaces, filters } = useWorkspacesTable(workspacesList);

  if (!workspacesList.length) {
    return <Description>No workspaces created yet.</Description>;
  }

  return (
    <Stack>
      <StyledNumSelectedHeader numSelected={selectedItems.size} />
      <WorkspaceItemsTable
        items={filteredWorkspaces}
        isLoading={isLoading}
        itemType="workspace"
        filters={filters}
        tableFields={tableFields}
        initialSortField={initialSortField}
        selectedItemIds={selectedItems}
        toggleItem={toggleItem}
      />
    </Stack>
  );
}
