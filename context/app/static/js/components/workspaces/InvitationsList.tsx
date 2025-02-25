import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useInvitationsList } from 'js/components/workspaces/hooks';
import InvitationTabs from 'js/components/workspaces/InvitationTabs';
import Description from 'js/shared-styles/sections/Description';

function InvitationsList() {
  const { sentInvitations, receivedInvitations, invitationsLoading } = useInvitationsList();

  return (
    <Stack spacing={1}>
      <Typography variant="h4">Workspace Invitations</Typography>
      <Description>
        Manage your workspace collaboration with notifications for invitations shared with you or sent by you. For
        received invitations, you can preview the workspace details before deciding to accept or decline the invitation.
      </Description>
      <InvitationTabs
        sentInvitations={sentInvitations}
        receivedInvitations={receivedInvitations}
        isLoading={invitationsLoading}
      />
    </Stack>
  );
}

export default InvitationsList;
