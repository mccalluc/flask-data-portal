import { get } from 'js/helpers/nodash';
import type { WorkspaceItem } from 'js/components/workspaces/Tables/WorkspaceItemsTable/types';
import {
  DEFAULT_GPU_ENABLED,
  DEFAULT_JOB_TYPE,
  DEFAULT_MEMORY_MB,
  DEFAULT_NUM_CPUS,
  DEFAULT_PYTHON_TEMPLATE_KEY,
  DEFAULT_R_TEMPLATE_KEY,
  DEFAULT_TIME_LIMIT_MINUTES,
} from './constants';
import {
  jobStatuses,
  validateJobStatus,
  workspaceStatuses,
  validateWorkspaceStatus,
  isWorkspaceStatus,
  getJobStatusDisplayName,
  JOB_DISPLAY_NAMES,
  ACTIVE,
  ACTIVATING,
  INACTIVE,
  JobStatusDisplayName,
} from './statusCodes';

import type {
  MergedWorkspace,
  Workspace,
  WorkspaceAPIResponse,
  WorkspaceJob,
  WorkspaceFile,
  TemplatesTypes,
  WorkspaceInvitation,
  WorkspaceWithUserId,
} from './types';

interface WorkspaceActionArgs {
  workspaceId: number;
  workspacesEndpoint: string;
  workspacesToken: string;
}

interface CondensedJob {
  status?: JobStatusDisplayName;
  allowNew: boolean;
  url?: string;
  message?: string;
}

interface GetWorkspaceJobArgs extends WorkspaceActionArgs {
  setMessage: (message?: string) => void;
  setDead: (dead: boolean) => void;
}

/**
 * Creates the headers for a workspace request
 * @param workspacesToken The user's workspaces API token
 * @returns formatted headers for a workspace request
 */
function getWorkspaceHeaders(workspacesToken: string) {
  return {
    'Content-Type': 'application/json',
    'UWS-Authorization': `Token ${workspacesToken}`,
  };
}

/**
 * Gets the name of a workspace file as a string
 * @param file A workspace file. Currently this is inconsistent between an object with a name entry and a string.
 * @returns The workspace file as a string
 */
function getWorkspaceFileName(file: WorkspaceFile) {
  if (typeof file === 'string') {
    return file;
  }

  return file.name;
}

/**
 * Prepends a slash to a file name if it doesn't already have one
 * @param fileName The file name to format
 */
function formatFileName(fileName: string) {
  if (fileName.startsWith('/')) {
    return fileName;
  }
  return `/${fileName}`;
}

/**
 * Gets the path of the notebook for a workspace
 * @param workspace The workspace to get the notebook path for
 * @returns The path of the notebook for the workspace
 */
function getNotebookPath(workspace: Workspace) {
  const { files = [] } = workspace.workspace_details.current_workspace_details;
  const { files: requestFiles = [] } = workspace.workspace_details.request_workspace_details;
  const combinedFiles = files.concat(requestFiles).map((file) => {
    const fileName = getWorkspaceFileName(file);
    if (typeof file === 'string') {
      return formatFileName(fileName);
    }
    return { ...file, name: formatFileName(fileName) };
  });
  return combinedFiles.reduce<string>((acc, file) => {
    const path = getWorkspaceFileName(file);
    if (path.endsWith('.ipynb') && acc.length === 0) {
      return path;
    }
    return acc;
  }, '');
}

/**
 * Assigns jobs to workspaces based on workspace_id
 * @param jobs The list of jobs to assign
 * @param workspaces The list of workspaces to assign
 * @returns The list of workspaces with its `jobs` and `path` fields populated
 */
function mergeJobsIntoWorkspaces(jobs: WorkspaceJob[], workspaces: Workspace[]): MergedWorkspace[] {
  workspaces.forEach((ws) => {
    validateWorkspaceStatus(ws.status);
  });
  const activeWorkspaces = workspaces.filter(
    ({ status }) => isWorkspaceStatus(status) && !workspaceStatuses[status].isDone,
  );

  const wsIdToJobs: Record<number, WorkspaceJob[]> = {};
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

  const mergedWorkspaces: MergedWorkspace[] = activeWorkspaces
    .map((workspace) => ({
      ...workspace,
      jobs: wsIdToJobs?.[workspace.id] || [],
      path: getNotebookPath(workspace),
    }))
    .sort((a, b) => {
      // The active workspace is first followed by the remaining workspaces sorted by name.
      if (a.status === 'active' && b.status !== 'active') {
        return -1;
      }
      if (b.status === 'active' && a.status !== 'active') {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

  return mergedWorkspaces;
}

type JobDetails = Pick<WorkspaceJob, 'job_details'>;

/**
 * Extracts the URL corresponding to a job
 * @param job The job to extract the URL from
 * @returns The URL to redirect the user to, if it exists
 */
function getJobUrl(job: JobDetails): string | undefined {
  const details = job.job_details.current_job_details;
  if (details.connection_details) {
    const { url_domain, url_path } = details.connection_details;
    return `${url_domain}${url_path}`;
  }
  return undefined;
}

/**
 * Extracts the message corresponding to a job
 * @param job The job to extract the message from
 * @returns The message to display to the user, if it exists
 */
function getJobMessage(job: JobDetails): string {
  const details = job.job_details.current_job_details;
  return details.message;
}

/**
 * Find the job with the highest status.
 * @param jobs A list of jobs to extract the best job from.
 * @returns The job with the highest status.
 */
function findBestJob(jobs: WorkspaceJob[]) {
  const displayStatusJobs = jobs.map((job) => ({
    ...job,
    status: getJobStatusDisplayName(job.status),
  }));

  const bestJob = JOB_DISPLAY_NAMES.map((status) => displayStatusJobs.find((job) => job.status === status)).find(
    (job) => job,
  ); // Trivial .find() to just take the job with highest status.

  return bestJob;
}

/**
 * Return the type of the job with the highest status.
 * @param jobs A list of jobs to extract the best job type from.
 * @returns The type of the job with the highest status if it exists, else the default job type.
 */
function findBestJobType(jobs: WorkspaceJob[]) {
  const bestJob = findBestJob(jobs);
  return bestJob?.job_type ?? DEFAULT_JOB_TYPE;
}

/**
 * Finds the job with the highest status and returns a digest.
 * @param jobs A list of jobs to extract the best job from.
 * @returns A digest of the best job to use for a workspace which includes the status, whether a new job can be created, and the URL and message if the job is active/activating
 */
function condenseJobs(jobs: WorkspaceJob[]): CondensedJob {
  const bestJob = findBestJob(jobs);

  const status = bestJob?.status;
  switch (status) {
    case ACTIVE:
      // This case should never happen, but we'll handle it anyway for TypeScript completeness.
      if (!bestJob) {
        throw Error(`Unexpectedly missing job with status ${ACTIVE}`);
      }
      return { status, allowNew: false, url: getJobUrl(bestJob), message: getJobMessage(bestJob) };
    case ACTIVATING:
      return { status, allowNew: false, message: ACTIVATING };
    case INACTIVE:
      return { status, allowNew: true };
    case undefined:
    default:
      // No jobs of any status.
      return { status, allowNew: true };
  }
}

async function getWorkspaceJob({
  workspaceId,
  setMessage,
  setDead,
  workspacesEndpoint,
  workspacesToken,
}: GetWorkspaceJobArgs) {
  const jobsResponse = await fetch(`${workspacesEndpoint}/jobs`, {
    method: 'GET',
    headers: getWorkspaceHeaders(workspacesToken),
  });

  if (!jobsResponse.ok) {
    setDead(true);
    setMessage('API Error; Are you logged in?');
    return null;
  }

  const result = (await jobsResponse.json()) as WorkspaceAPIResponse<{ jobs: WorkspaceJob[] }>;
  if (!result.success) {
    setDead(true);
    setMessage(result.message);
    return null;
  }
  const { jobs } = result.data;
  const jobsForWorkspace = jobs.filter((job) => String(job.workspace_id) === String(workspaceId));
  const job = condenseJobs(jobsForWorkspace);
  setMessage(job?.message);
  return job;
}

async function locationIfJobRunning({
  workspaceId,
  setMessage,
  setDead,
  workspacesEndpoint,
  workspacesToken,
}: GetWorkspaceJobArgs) {
  const job = await getWorkspaceJob({ workspaceId, setMessage, setDead, workspacesEndpoint, workspacesToken });

  if (job?.url) {
    return job.url;
  }

  return null;
}

function getWorkspaceStartLink(workspace: Workspace, templatePath?: string) {
  const path = getNotebookPath(workspace);
  return `/workspaces/start/${workspace.id}?notebook_path=${encodeURIComponent(templatePath ?? path)}`;
}

function getWorkspaceLink(workspace: Workspace) {
  return `/workspaces/${workspace.id}`;
}

function isRunningWorkspace(workspace: MergedWorkspace) {
  return workspace.jobs.some((job) => job.status === 'running' || job.status === 'pending');
}

function findRunningWorkspace(workspaces: MergedWorkspace[]) {
  return workspaces.find((workspace) => isRunningWorkspace(workspace));
}

function isRunningJob(job: WorkspaceJob) {
  return job.status === 'running' || job.status === 'pending';
}

function buildDatasetSymlinks({ datasetUUIDs }: { datasetUUIDs: string[] }) {
  return datasetUUIDs.map((uuid) => ({
    name: `datasets/${uuid}`,
    dataset_uuid: uuid,
  }));
}

function getDefaultJobType({ workspace }: { workspace: Workspace }) {
  return workspace?.default_job_type ?? DEFAULT_JOB_TYPE;
}

/**
 * Sort templates alphabetically by title, with all disabled templates first, then the default python template, then the default R template.
 *   Ex: [disabled1, disabled2, defaultPython, defaultR, templateA, templateB, ...]
 * @param templates The templates to sort.
 * @param disabledTemplates The templates that are disabled.
 * @returns The sorted templates.
 */
function sortTemplates(templates: TemplatesTypes, disabledTemplates?: TemplatesTypes) {
  return Object.fromEntries(
    Object.entries(templates).sort(([keyA, templateA], [keyB, templateB]) => {
      const isSelectedA = disabledTemplates && keyA in disabledTemplates;
      const isSelectedB = disabledTemplates && keyB in disabledTemplates;

      // Disabled templates
      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;

      // Default Python template
      if (keyA === DEFAULT_PYTHON_TEMPLATE_KEY && keyB !== DEFAULT_PYTHON_TEMPLATE_KEY) return -1;
      if (keyB === DEFAULT_PYTHON_TEMPLATE_KEY && keyA !== DEFAULT_PYTHON_TEMPLATE_KEY) return 1;

      // Default R template
      if (keyA === DEFAULT_R_TEMPLATE_KEY && keyB !== DEFAULT_PYTHON_TEMPLATE_KEY) return -1;
      if (keyB === DEFAULT_R_TEMPLATE_KEY && keyA !== DEFAULT_PYTHON_TEMPLATE_KEY) return 1;

      // Alphabetical sorting by title for remaining templates
      return templateA.title.localeCompare(templateB.title);
    }),
  ) as TemplatesTypes;
}

/**
 * Get the resource options for a workspace, if they exist.
 * @param workspace The workspace to get the resource options from.
 * @returns The resource options if they exist, else the default resource values.
 */
function getWorkspaceResourceOptions(workspace: MergedWorkspace) {
  return (
    findBestJob(workspace?.jobs ?? [])?.job_details?.request_job_details?.resource_options ?? {
      num_cpus: DEFAULT_NUM_CPUS,
      memory_mb: DEFAULT_MEMORY_MB,
      time_limit_minutes: DEFAULT_TIME_LIMIT_MINUTES,
      gpu_enabled: DEFAULT_GPU_ENABLED,
    }
  );
}

function convert(value: number, conversionFactor: number) {
  return value / conversionFactor;
}
function unconvert(value: number, conversionFactor: number) {
  return value * conversionFactor;
}

/**
 * Extract the prefix from a field if it is a workspace invitation.
 * @param field The field to extract the prefix from.
 * @returns 'original_workspace_id.' or 'shared_workspace_id.' if the field is a workspace invitation, else an empty string.
 */
function getFieldPrefix(field: string) {
  // Get appropriate prefix if this is a workspace invitation
  const regex = /^(original_workspace_id|shared_workspace_id)/;
  const match = regex.exec(field);
  const prefix = match ? `${match[0]}.` : '';

  return prefix;
}

/**
 * Get the value of a field from a workspace or workspace invitation.
 * @param item The workspace or workspace invitation to get the field value from.
 * @param field The field to get the value of.
 * @param prefix The prefix to use if the field is a workspace invitation.
 * @returns The value of the field.
 */
function getFieldValue({ item, field, prefix }: { item: WorkspaceItem; field: string; prefix?: string }) {
  // datetime_last_job_launch starts as null, so we fall back to datetime_created if the workspace has never been launched
  if (field === 'datetime_last_job_launch') {
    const launchDate = get(item, field, '');
    const createdDate = get(item, `datetime_created`, '');

    return launchDate || createdDate;
  }

  const fieldWithPrefix = prefix ? `${prefix}${field}` : field;
  return get(item, fieldWithPrefix, '');
}

function isInvitation(item: WorkspaceItem): item is WorkspaceInvitation {
  return 'shared_workspace_id' in item;
}

function isWorkspace(item: WorkspaceItem): item is WorkspaceWithUserId {
  return 'id' in item;
}

export {
  mergeJobsIntoWorkspaces,
  findBestJob,
  findBestJobType,
  condenseJobs,
  locationIfJobRunning,
  getWorkspaceFileName,
  getWorkspaceStartLink,
  getWorkspaceLink,
  getWorkspaceHeaders,
  getWorkspaceJob,
  isRunningWorkspace,
  findRunningWorkspace,
  isRunningJob,
  buildDatasetSymlinks,
  getDefaultJobType,
  sortTemplates,
  getWorkspaceResourceOptions,
  convert,
  unconvert,
  getFieldPrefix,
  getFieldValue,
  isInvitation,
  isWorkspace,
};
