async function createNotebookWorkspace({
  workspacesEndpoint,
  workspacesToken,
  workspaceName,
  workspaceDescription,
  notebookContent,
}) {
  await fetch(`${workspacesEndpoint}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'UWS-Authorization': `Token ${workspacesToken}`,
    },
    body: JSON.stringify({
      name: workspaceName,
      description: workspaceDescription,
      workspace_details: {
        symlinks: [],
        files: [
          {
            name: 'notebook.ipynb',
            content: notebookContent,
          },
        ],
      },
    }),
  });
}

async function startJob({ workspaceId, workspacesEndpoint, workspacesToken }) {
  await fetch(`${workspacesEndpoint}/workspaces/${workspaceId}/start`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'UWS-Authorization': `Token ${workspacesToken}`,
    },
    body: JSON.stringify({
      job_type: 'JupyterLabJob',
      job_details: {},
    }),
  });
}

function mergeJobsIntoWorkspaces(jobs, workspaces) {
  const wsIdToJobs = {};
  jobs.forEach((job) => {
    const { workspace_id } = job;
    if (!(workspace_id in wsIdToJobs)) {
      wsIdToJobs[workspace_id] = [];
    }
    wsIdToJobs[workspace_id].push(job);
  });

  workspaces.forEach((workspace) => {
    // eslint-disable-next-line no-param-reassign
    workspace.jobs = wsIdToJobs?.[workspace.id] || [];
  });

  return workspaces;
}

function condenseJobs(jobs) {
  const ACTIVE = 'Active';
  const ACTIVATING = 'Activating';
  const INACTIVE = 'Inactive';

  function getDisplayStatus(status) {
    return (
      {
        pending: ACTIVATING,
        running: ACTIVE,
      }[status] || INACTIVE
    );
  }

  function getJobUrl(job) {
    const { url_domain, url_path } = job.job_details.current_job_details.connection_details;
    return `${url_domain}${url_path}`;
  }

  const displayJobs = jobs.map((job) => ({ ...job, status: getDisplayStatus(job.status) }));

  const bestJob = [ACTIVE, ACTIVATING, INACTIVE]
    .map((status) => displayJobs.find((job) => job.status === status))
    .find((job) => job);

  const justStatus = { status: bestJob?.status };
  if (bestJob?.status === ACTIVE) {
    return { ...justStatus, allowNew: false, url: getJobUrl(bestJob) };
  }
  if (bestJob?.status === ACTIVATING) {
    return { ...justStatus, allowNew: false };
  }
  if (bestJob?.status === INACTIVE) {
    return { ...justStatus, allowNew: true };
  }
  return { ...justStatus, allowNew: true };
}

export { createNotebookWorkspace, startJob, mergeJobsIntoWorkspaces, condenseJobs };
