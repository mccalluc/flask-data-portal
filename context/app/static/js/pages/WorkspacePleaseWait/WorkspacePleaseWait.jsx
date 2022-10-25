import React, { useState, useContext } from 'react';

import { AppContext } from 'js/components/Providers';
import { locationIfJobRunning } from 'js/components/workspaces/utils';

function WorkspacePleaseWait({ workspaceId }) {
  const [message, setMessage] = useState();
  const [dead, setDead] = useState();
  const { workspacesEndpoint, workspacesToken } = useContext(AppContext);

  async function setLocationOrRetry() {
    if (dead) {
      return;
    }
    const jobLocation = await locationIfJobRunning({
      workspaceId,
      setMessage,
      setDead,
      workspacesEndpoint,
      workspacesToken,
    });
    if (jobLocation) {
      const [urlBase, urlQuery] = jobLocation.split('?');
      const workspacePath = document.location.hash.slice(1);
      const path = workspacePath ? `/tree/${workspacePath}` : '';
      const jupyterUrl = `${urlBase}${path}?${urlQuery}`;
      document.location = jupyterUrl;
    } else {
      setTimeout(setLocationOrRetry, 5000);
    }
  }

  setLocationOrRetry();

  return <>Please wait... {message}</>;
}

export default WorkspacePleaseWait;
