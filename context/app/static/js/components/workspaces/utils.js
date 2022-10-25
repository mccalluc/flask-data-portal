import { jobStatuses, validateJobStatus, workspaceStatuses, validateWorkspaceStatus } from './statusCodes';

function getWorkspacesApiHeaders(workspacesToken) {
  if (!workspacesToken) {
    throw Error('token missing; login again');
  }
  return {
    'Content-Type': 'application/json',
    'UWS-Authorization': `Token ${workspacesToken}`,
  };
}

async function createEmptyWorkspace({ workspacesEndpoint, workspacesToken, workspaceName, workspaceDescription }) {
  await fetch(`${workspacesEndpoint}/workspaces`, {
    method: 'POST',
    headers: getWorkspacesApiHeaders(workspacesToken),
    body: JSON.stringify({
      name: workspaceName,
      description: workspaceDescription,
      workspace_details: {
        symlinks: [],
        files: [],
      },
    }),
  });
}

async function stopJob({ jobId, workspacesEndpoint, workspacesToken }) {
  const response = await fetch(`${workspacesEndpoint}/jobs/${jobId}/stop/`, {
    method: 'PUT',
    headers: getWorkspacesApiHeaders(workspacesToken),
  });
  if (!response.ok) {
    throw Error(`Job stop for job #${jobId} failed`);
  }
}

async function deleteWorkspace({ workspaceId, workspacesEndpoint, workspacesToken }) {
  const headers = getWorkspacesApiHeaders(workspacesToken);
  const response = await fetch(`${workspacesEndpoint}/workspaces/${workspaceId}/`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw Error(`Workspace deletion for workspace #${workspaceId} failed`);
  }
}

async function stopJobs({ workspaceId, workspacesEndpoint, workspacesToken }) {
  const headers = getWorkspacesApiHeaders(workspacesToken);
  const jobsResponse = await fetch(`${workspacesEndpoint}/jobs`, { headers });
  const jobsResults = await jobsResponse.json();
  const { jobs } = jobsResults.data;
  jobs.forEach((job) => {
    if (String(job.workspace_id) === String(workspaceId)) {
      stopJob({ jobId: job.id, workspacesEndpoint, workspacesToken });
    }
  });
}

async function startJob({ workspaceId, workspacesEndpoint, workspacesToken, setMessage, setDead }) {
  const startResponse = await fetch(`${workspacesEndpoint}/workspaces/${workspaceId}/start`, {
    method: 'PUT',
    headers: getWorkspacesApiHeaders(workspacesToken),
    body: JSON.stringify({
      job_type: 'JupyterLabJob',
      job_details: {},
    }),
  });

  if (!startResponse.ok) {
    setDead(true);
  }
  const start = await startResponse.json();
  setMessage(start.message);
}

function getNotebookPath(workspace) {
  const { files } = workspace.workspace_details.current_workspace_details;
  return (files || []).find(({ name }) => name.endsWith('.ipynb'))?.name || '';
}

function mergeJobsIntoWorkspaces(jobs, workspaces) {
  workspaces.forEach((ws) => {
    validateWorkspaceStatus(ws.status);
  });
  const activeWorkspaces = workspaces.filter(({ status }) => !workspaceStatuses[status].isDone);

  const wsIdToJobs = {};
  jobs.forEach((job) => {
    const { status, workspace_id } = job;
    validateJobStatus(status);
    if (jobStatuses[status].isDone) {
      return;
    }
    if (!(workspace_id in wsIdToJobs)) {
      wsIdToJobs[workspace_id] = [];
    }
    wsIdToJobs[workspace_id].push(job);
  });

  activeWorkspaces.forEach((workspace) => {
    // eslint-disable-next-line no-param-reassign
    workspace.jobs = wsIdToJobs?.[workspace.id] || [];
    // eslint-disable-next-line no-param-reassign
    workspace.path = getNotebookPath(workspace);
  });

  return activeWorkspaces;
}

function condenseJobs(jobs) {
  const ACTIVE = 'Active';
  const ACTIVATING = 'Activating';
  const INACTIVE = 'Inactive';

  function getDisplayStatus(status) {
    validateJobStatus(status);
    const displayStatus = {
      pending: ACTIVATING,
      running: ACTIVE,
      complete: INACTIVE,
      failed: INACTIVE,
    }[status];
    if (!displayStatus) {
      throw Error(`No display status found for API status ${status}`);
    }
    return displayStatus;
  }

  function getJobUrl(job) {
    const details = job.job_details.current_job_details;
    if (details.connection_details) {
      const { url_domain, url_path } = details.connection_details;
      /*
      API is returning URLs that end with "/lab", but these redirect to "/lab/tree"
      and then produce an error message:
      
      The path:
        /passthrough/l002.hive.psc.edu/421/lab/tree
      was not found. JupyterLab redirected to:
        /passthrough/l002.hive.psc.edu/421/
      */
      const clean_url_path = url_path.replace(/\/lab\?/, '?');
      return `${url_domain}${clean_url_path}`;
    }
    return null;
  }

  function getJobMessage(job) {
    const details = job.job_details.current_job_details;
    return details.message;
  }

  const displayStatusJobs = jobs.map((job) => ({
    ...job,
    status: getDisplayStatus(job.status),
  }));

  const bestJob = [ACTIVE, ACTIVATING, INACTIVE]
    .map((status) => displayStatusJobs.find((job) => job.status === status))
    .find((job) => job); // Trivial .find() to just take the job with highest status.

  const status = bestJob?.status;
  switch (status) {
    case ACTIVE:
      return { status, allowNew: false, url: getJobUrl(bestJob), message: getJobMessage(bestJob) };
    case ACTIVATING:
      return { status, allowNew: false, message: ACTIVATING };
    case INACTIVE:
      return { status, allowNew: true };
    default:
      // No jobs of any status.
      return { status, allowNew: true };
  }
}

async function locationIfJobRunning({ workspaceId, setMessage, setDead, workspacesEndpoint, workspacesToken }) {
  const jobsResponse = await fetch(`${workspacesEndpoint}/jobs`, {
    method: 'GET',
    headers: getWorkspacesApiHeaders(workspacesToken),
  });
  if (!jobsResponse.ok) {
    setDead(true);
    setMessage('API Error; Are you logged in?');
    return null;
  }

  const jobsResults = await jobsResponse.json();
  const { jobs } = jobsResults.data;
  const jobsForWorkspace = jobs.filter((job) => String(job.workspace_id) === String(workspaceId));
  const job = condenseJobs(jobsForWorkspace);
  setMessage(job.message);

  if (job.url) {
    return job.url;
  }
  if (job.allowNew) {
    await startJob({ workspaceId, workspacesEndpoint, workspacesToken, setMessage, setDead });
  }
  return null;
}

export {
  getWorkspacesApiHeaders,
  createEmptyWorkspace,
  deleteWorkspace,
  stopJobs,
  mergeJobsIntoWorkspaces,
  condenseJobs,
  locationIfJobRunning,
};
