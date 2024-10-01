import React from 'react';

import SelectableTableProvider from 'js/shared-styles/tables/SelectableTableProvider';
import AddDatasetsFromSearchDialog from 'js/components/workspaces/AddDatasetsFromSearchDialog';
import { DialogType, useEditWorkspaceStore } from 'js/stores/useWorkspaceModalStore';

interface AddDatasetsFromDetailDialogProps {
  uuid: string;
  dialogType: DialogType;
}

function AddDatasetsFromDetailDialog({ uuid, dialogType }: AddDatasetsFromDetailDialogProps) {
  const { dialogType: currentDialogType } = useEditWorkspaceStore();

  if (currentDialogType !== dialogType) {
    return null;
  }

  return (
    // We're populating the table provider with the dataset from the detail page so as not to duplicate logic from the search dialog
    <SelectableTableProvider tableLabel="Add Datasets From Detail Dialog" selectedRows={new Set([uuid])}>
      <AddDatasetsFromSearchDialog />
    </SelectableTableProvider>
  );
}

export default AddDatasetsFromDetailDialog;
