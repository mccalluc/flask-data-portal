import React from 'react';
import Stack from '@mui/material/Stack';

import { useAppContext } from 'js/components/Contexts';

import InvitationsList from './InvitationsList';
import WorkspacesList from './WorkspacesList';

function WorkspacesAuthenticated() {
  const { workspacesToken } = useAppContext();

  if (!workspacesToken) {
    throw Error('The workspaces token request failed at login');
  }

  return (
    <Stack spacing={3}>
      <InvitationsList />
      <WorkspacesList />
    </Stack>
  );
}

export default WorkspacesAuthenticated;
