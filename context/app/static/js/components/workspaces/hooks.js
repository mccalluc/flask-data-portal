import { useContext, useState, useEffect } from 'react';

import { AppContext } from 'js/components/Providers';

import { mergeJobsIntoWorkspaces, getWorkspacesApiHeaders } from './utils';

function useWorkspacesList() {
  const [workspacesList, setWorkspacesList] = useState([]);
  // TODO: isLoading:
  // const [isLoading, setIsLoading] = useState(true);

  const { workspacesEndpoint, workspacesToken } = useContext(AppContext);

  useEffect(() => {
    async function getAndSetWorkspacesList() {
      const fetchOpts = {
        method: 'GET',
        headers: getWorkspacesApiHeaders(workspacesToken),
      };
      const [workspacesResponse, jobsResponse] = await Promise.all([
        fetch(`${workspacesEndpoint}/workspaces`, fetchOpts),
        fetch(`${workspacesEndpoint}/jobs`, fetchOpts),
      ]);

      if (!workspacesResponse.ok || !jobsResponse.ok) {
        console.error('Workspaces API failed. Workspaces:', workspacesResponse, 'Jobs:', jobsResponse);
        return;
      }

      // This is could be parallelized too...
      // but since it's not network-bound, little benefit.
      const workspaceResults = await workspacesResponse.json();
      const jobsResults = await jobsResponse.json();

      const workspaces = mergeJobsIntoWorkspaces(jobsResults.data.jobs, workspaceResults.data.workspaces);

      setWorkspacesList(workspaces);
      // TODO:
      // setIsLoading(false);
    }
    getAndSetWorkspacesList();
  }, [workspacesEndpoint, workspacesToken]);

  return { workspacesList };
}

export { useWorkspacesList };
