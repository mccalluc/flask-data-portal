import React from 'react';
import Button from '@mui/material/Button';
import AddRounded from '@mui/icons-material/AddRounded';
import { WorkspacesEventCategories } from 'js/components/workspaces/types';
import NewWorkspaceDialog from './NewWorkspaceDialog';
import { useCreateWorkspaceForm } from './useCreateWorkspaceForm';

function NewWorkspaceDialogFromWorkspaceList() {
  const { setDialogIsOpen, ...rest } = useCreateWorkspaceForm({});

  return (
    <>
      <Button
        onClick={() => setDialogIsOpen(true)}
        variant="contained"
        startIcon={<AddRounded sx={{ width: '1rem' }} />}
        sx={{ height: '2.5rem' }}
      >
        Create New
      </Button>
      <NewWorkspaceDialog
        showDatasetsSearchBar
        trackingInfo={{ category: WorkspacesEventCategories.WorkspaceLandingPage }}
        {...rest}
      />
    </>
  );
}

export default NewWorkspaceDialogFromWorkspaceList;
