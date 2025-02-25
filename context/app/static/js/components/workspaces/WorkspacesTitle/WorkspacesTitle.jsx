import React from 'react';

import IconPageTitle from 'js/shared-styles/pages/IconPageTitle';
import WorkspacesIcon from 'assets/svg/workspaces.svg';

function WorkspacesTitle() {
  return (
    <IconPageTitle icon={WorkspacesIcon} data-testid="my-workspaces-title">
      Workspaces
    </IconPageTitle>
  );
}

export default WorkspacesTitle;
