import React from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';

import { PanelWrapper } from 'js/shared-styles/panels';

import WorkspaceDetails from 'js/components/workspaces/WorkspaceDetails';
import { useSnackbarActions } from 'js/shared-styles/snackbars';

import { useWorkspacesList } from './hooks';
import { MergedWorkspace } from './types';

interface WorkspaceListItemProps {
  workspace: MergedWorkspace;
  toggleItem: (workspaceId: number) => void;
  selected: boolean;
}

type WorkspaceButtonProps = Pick<WorkspaceListItemProps, 'workspace'>;

// TODO: Convert the actual hook to TS
interface UseWorkspacesList {
  handleStartWorkspace: (workspaceId: number) => Promise<void>;
  handleDeleteWorkspace: (workspaceId: number) => Promise<void>;
  handleStopWorkspace: (workspaceId: number) => Promise<void>;
}

function WorkspaceListItemButtons({ workspace }: WorkspaceButtonProps) {
  const { handleStartWorkspace, handleStopWorkspace } = useWorkspacesList() as UseWorkspacesList;
  const { toastError } = useSnackbarActions();
  if (workspace.status === 'deleting') {
    return (
      <Button type="button" disabled variant="elevated" size="small">
        Deleting...
      </Button>
    );
  }
  if (workspace.jobs.length > 0) {
    return (
      <Button
        type="button"
        variant="elevated"
        size="small"
        disabled={workspace.jobs.length === 0}
        sx={{ height: '32px' }}
        onClick={() => {
          handleStopWorkspace(workspace.id).catch((err) => {
            toastError(`Error stopping ${workspace.name}.`);
            console.error(err);
          });
        }}
      >
        Stop Jobs
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="elevated"
      size="small"
      sx={{ height: '32px' }}
      onClick={() => {
        handleStartWorkspace(workspace.id).catch((err) => {
          toastError(`Error starting ${workspace.name}.`);
          console.error(err);
        });
      }}
    >
      Launch Workspace
    </Button>
  );
}

function WorkspaceListItem({ workspace, toggleItem, selected }: WorkspaceListItemProps) {
  const { handleStartWorkspace } = useWorkspacesList() as UseWorkspacesList;
  return (
    <PanelWrapper key={workspace.id}>
      <Stack direction="row" spacing={2}>
        <Checkbox
          aria-label={`Select ${workspace.name} for deletion`}
          checked={selected}
          onChange={() => toggleItem(workspace.id)}
        />
        <WorkspaceDetails workspace={workspace} handleStartWorkspace={handleStartWorkspace} />
      </Stack>
      <WorkspaceListItemButtons workspace={workspace} />
    </PanelWrapper>
  );
}

export default WorkspaceListItem;
