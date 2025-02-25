import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useCallback } from 'react';

import { trackEvent } from 'js/helpers/trackers';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from '../Contexts';
import {
  AllWorkspaceInvitations,
  Workspace,
  WorkspaceAPIResponse,
  WorkspaceAPIResponseWithoutData,
  WorkspaceJob,
  WorkspaceJobType,
  WorkspaceResourceOptions,
  WorkspacesEventCategories,
} from './types';
import { getWorkspaceHeaders, isRunningJob } from './utils';

export const EXCESSIVE_NUMBER_OF_WORKSPACE_DATASETS = 25;
export const MAX_NUMBER_OF_WORKSPACE_DATASETS = 150;

/**
 * Generates API URLs for various workspaces API actions
 * @param workspacesEndpoint endpoint to use as the base for API URLs
 * @returns an API URL generator
 */
export const apiUrls = (workspacesEndpoint: string) => ({
  // Jobs
  get jobTypes(): string {
    return `${workspacesEndpoint}/job_types`;
  },
  get jobs(): string {
    return `${workspacesEndpoint}/jobs`;
  },
  stopJob(jobId: number): string {
    return `${workspacesEndpoint}/jobs/${jobId}/stop`;
  },
  // Workspaces
  get workspaces(): string {
    return `${workspacesEndpoint}/workspaces`;
  },
  get createWorkspaceFromTemplates(): string {
    return `${workspacesEndpoint}/workspaces/`;
  },
  workspace(workspaceId: number): string {
    return `${workspacesEndpoint}/workspaces/${workspaceId}`;
  },
  startWorkspace(workspaceId: number): string {
    return `${workspacesEndpoint}/workspaces/${workspaceId}/start`;
  },
  createWorkspaceFromNotebookPath(path: string): string {
    return `/notebooks/${path}`;
  },
  // Invitations
  get invitations(): string {
    return `${workspacesEndpoint}/shared_workspaces`;
  },
  invitation(invitationId: number): string {
    return `${workspacesEndpoint}/shared_workspaces/${invitationId}`;
  },
  acceptInvitation(invitationId: number): string {
    return `${workspacesEndpoint}/shared_workspaces/${invitationId}/accept`;
  },
  users(query: string): string {
    return `${workspacesEndpoint}/users?search=${query}`;
  },
});

export function useWorkspacesApiURLs() {
  const { workspacesEndpoint } = useAppContext();
  return apiUrls(workspacesEndpoint);
}

export function useWorkspaceHeaders(): HeadersInit {
  const { workspacesToken } = useAppContext();
  return getWorkspaceHeaders(workspacesToken);
}

export function useHasWorkspaceAccess() {
  const { workspacesToken } = useAppContext();
  return Boolean(workspacesToken);
}

export function useBuildWorkspacesSWRKey(): {
  buildKey: ({ url }: { url: string }) => [string, HeadersInit] | null;
  hasAccess: boolean;
} {
  const hasAccess = useHasWorkspaceAccess();
  const headers = useWorkspaceHeaders();

  return {
    buildKey: useCallback(
      ({ url }: { url: string }) => {
        return hasAccess ? [url, headers] : null;
      },
      [hasAccess, headers],
    ),
    hasAccess,
  };
}

interface APIAction {
  url: string;
  headers?: HeadersInit;
}

interface StopJobArgs extends APIAction {
  jobId: number;
}

/**
 * Stop a currently-running workspace job
 * @param key Readable key for the current action
 * @param param2.arg.headers The headers to use for the request
 * @param param2.arg.jobId ID of the job to stop
 * @param param2.arg.url The URL to use for the request
 * @returns The response from the server if the request was successful
 */
async function fetchStopJob(_key: string, { arg: { headers, jobId, url } }: { arg: StopJobArgs }) {
  const response = await fetch(url, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) {
    throw Error(`Job stop for job ${jobId} failed`);
  }
  return response;
}

export function useStopJob() {
  const apiURLs = useWorkspacesApiURLs();
  const headers = useWorkspaceHeaders();

  const { trigger, isMutating } = useSWRMutation('stop-job', fetchStopJob);

  const stopJobCallback = useCallback(
    async (jobId: number) => {
      await trigger({
        jobId,
        url: apiURLs.stopJob(jobId),
        headers,
      });
    },
    [apiURLs, headers, trigger],
  );

  return { stopJob: stopJobCallback, isStoppingJob: isMutating };
}

async function fetchJobs(url: string, headers: APIAction['headers']) {
  const response = await fetch(url, { headers });
  const result = (await response.json()) as WorkspaceAPIResponse<{ jobs: WorkspaceJob[] }>;
  if (!result.success) {
    throw Error(result?.message ? `Failed to get jobs: ${result.message}` : 'Unknown error');
  }
  return result;
}

export function useJobs() {
  const apiURLs = useWorkspacesApiURLs();

  const { buildKey, hasAccess } = useBuildWorkspacesSWRKey();

  const { data, isLoading, ...rest } = useSWR(buildKey({ url: apiURLs.jobs }), ([url, head]) => fetchJobs(url, head), {
    revalidateOnFocus: hasAccess,
    refreshInterval: 1000 * 60,
  });
  const jobs = data?.data?.jobs ?? [];
  return { jobs, isLoading, ...rest };
}

export function useWorkspaceJobs(workspaceId: number) {
  const { jobs, isLoading } = useJobs();
  return { jobs: jobs.filter((j) => j.workspace_id === workspaceId), isLoading };
}

function useFetchInvitations(invitationId?: number) {
  const urls = useWorkspacesApiURLs();
  const invitationUrl = invitationId ? urls.invitation(invitationId) : urls.invitations;
  const { buildKey, hasAccess } = useBuildWorkspacesSWRKey();

  const { data, isLoading, ...rest } = useSWR(
    buildKey({ url: invitationUrl }),
    ([url, head]) =>
      fetcher<WorkspaceAPIResponse<AllWorkspaceInvitations>>({
        url,
        requestInit: { headers: head },
        errorMessages: {
          404: invitationId
            ? `No workspace invitation with ID ${invitationId} found.`
            : 'No workspace invitations found with specified parameters.',
        },
      }),
    { revalidateOnFocus: hasAccess },
  );

  const sentInvitations = data?.data?.original_workspaces ?? [];
  const receivedInvitations = data?.data?.shared_workspaces ?? [];

  return { sentInvitations, receivedInvitations, isLoading, ...rest };
}

export function useInvitations() {
  return useFetchInvitations();
}

function useFetchWorkspaces(workspaceId?: number) {
  const urls = useWorkspacesApiURLs();
  const workspaceUrl = workspaceId ? urls.workspace(workspaceId) : urls.workspaces;
  const { buildKey, hasAccess } = useBuildWorkspacesSWRKey();

  const { data, isLoading, ...rest } = useSWR(
    buildKey({ url: workspaceUrl }),
    ([url, head]) =>
      fetcher<WorkspaceAPIResponse<{ workspaces: Workspace[] }>>({
        url,
        requestInit: { headers: head },
        errorMessages: {
          404: workspaceId
            ? `No workspace with ID ${workspaceId} found.`
            : 'No workspaces found with specified parameters.',
        },
      }),
    { revalidateOnFocus: hasAccess, refreshInterval: 1000 * 60 },
  );
  const workspaces = data?.data?.workspaces ?? [];
  return { workspaces, isLoading, ...rest };
}

export function useWorkspaces() {
  return useFetchWorkspaces();
}

export function useWorkspace(workspaceId: number) {
  const { workspaces, ...rest } = useFetchWorkspaces(workspaceId);
  if (rest.error) {
    throw rest.error;
  }
  const workspace = workspaces[0] ?? {};
  return { workspace, ...rest };
}

export function useStopWorkspace() {
  const { stopJob, isStoppingJob } = useStopJob();
  const { jobs } = useJobs();

  const stopWorkspace = useCallback(
    async (workspaceId: number) => {
      trackEvent(
        {
          category: WorkspacesEventCategories.Workspaces,
          action: 'Stop Workspace',
        },
        workspaceId,
      );
      await Promise.all(
        jobs.filter((j) => j.workspace_id === workspaceId && isRunningJob(j)).map((j) => stopJob(j.id)),
      );
    },
    [jobs, stopJob],
  );

  return { stopWorkspace, isStoppingWorkspace: isStoppingJob };
}

async function fetchDeleteWorkspace(
  _key: string,
  { arg: { workspaceId, headers, url } }: { arg: { headers: HeadersInit; workspaceId: number; url: string } },
) {
  trackEvent(
    {
      category: WorkspacesEventCategories.Workspaces,
      action: 'Delete Workspace',
    },
    workspaceId,
  );
  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw Error(`Workspace deletion for workspace #${workspaceId} failed`);
  }
}

export function useDeleteWorkspace() {
  const { trigger, isMutating } = useSWRMutation('delete-workspace', fetchDeleteWorkspace);
  const api = useWorkspacesApiURLs();
  const headers = useWorkspaceHeaders();

  const deleteWorkspace = useCallback(
    async (workspaceId: number) => {
      await trigger({
        workspaceId,
        url: api.workspace(workspaceId),
        headers,
      });
    },
    [headers, api, trigger],
  );

  return { deleteWorkspace, isDeleting: isMutating };
}

async function fetchJobTypes(jobTypesEndpoint: string): Promise<Record<string, WorkspaceJobType> | undefined> {
  const response = fetch(jobTypesEndpoint);
  const { data, success, message } = (await (await response).json()) as WorkspaceAPIResponse<{
    job_types: Record<string, WorkspaceJobType>;
  }>;
  if (!success) {
    throw new Error(`Failed to get job types: ${message}`);
  }
  return data.job_types;
}

export function useJobTypes() {
  const api = useWorkspacesApiURLs();
  const hasAccess = useHasWorkspaceAccess();
  return useSWR(hasAccess ? api.jobTypes : null, fetchJobTypes);
}

interface WorkspaceActionArgs extends APIAction {
  workspaceId: number;
  jobType: unknown;
  jobDetails: unknown;
  resourceOptions: WorkspaceResourceOptions;
}

async function startJob(
  _key: string,
  { arg: { workspaceId, jobDetails, jobType, resourceOptions, url, headers } }: { arg: WorkspaceActionArgs },
) {
  trackEvent(
    {
      category: WorkspacesEventCategories.Workspaces,
      action: 'Start Workspace',
    },
    workspaceId,
  );

  const result = fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      job_type: jobType,
      job_details: jobDetails,
      resource_options: resourceOptions,
    }),
  });
  if (!(await result).ok) {
    console.error(`Failed to start workspace ${workspaceId}`, result);
  }
}

export function useStartWorkspace() {
  const api = useWorkspacesApiURLs();
  const headers = useWorkspaceHeaders();
  const { trigger, isMutating } = useSWRMutation('start-workspace', startJob);
  const startWorkspace = useCallback(
    async ({
      workspaceId,
      jobTypeId,
      resourceOptions,
    }: {
      workspaceId: number;
      jobTypeId: string;
      resourceOptions: WorkspaceResourceOptions;
    }) => {
      return trigger({
        url: api.startWorkspace(workspaceId),
        jobDetails: {},
        resourceOptions,
        headers,
        jobType: jobTypeId,
        workspaceId,
      });
    },
    [trigger, api, headers],
  );
  return { startWorkspace, isStartingWorkspace: isMutating };
}

export interface CreateWorkspaceBody {
  name: string;
  description: string;
  default_job_type: string;
  workspace_details: {
    globus_groups_token: string;
    files: {
      name: string;
      content?: string;
    }[];
    symlinks: {
      name: string;
      dataset_uuid: string;
    }[];
  };
}

export interface CreateWorkspaceArgs extends APIAction {
  body: CreateWorkspaceBody;
}

async function createWorkspaceFetcher(_key: string, { arg: { body, url, headers } }: { arg: CreateWorkspaceArgs }) {
  trackEvent({
    category: WorkspacesEventCategories.Workspaces,
    action: 'Create Workspace',
    label: {
      name: body.name,
      files: body.workspace_details.files.map((f) => f.name),
      symlinks: body.workspace_details.symlinks.map((s) => s.name),
    },
  });

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
  if (!response.ok) {
    console.error('Create workspace failed', response);
  }
  const responseJson = (await response.json()) as WorkspaceAPIResponse<{ workspace: Workspace }>;
  if (!responseJson.success) {
    throw new Error(`Failed to create workspace: ${responseJson.message}`);
  }
  return responseJson.data.workspace;
}

export function useCreateWorkspace() {
  const api = useWorkspacesApiURLs();
  const headers = useWorkspaceHeaders();
  const { trigger, isMutating } = useSWRMutation('create-workspace', createWorkspaceFetcher);

  const createWorkspace = useCallback(
    (body: CreateWorkspaceBody) => {
      return trigger({
        url: api.createWorkspaceFromTemplates,
        body,
        headers,
      });
    },
    [trigger, api, headers],
  );

  return { createWorkspace, isCreatingWorkspace: isMutating };
}

export interface UpdateWorkspaceBody {
  name?: string;
  description?: string;
  default_job_type?: string;
  workspace_details?: {
    globus_groups_token?: string;
    files?: {
      name: string;
      content?: string;
    }[];
    symlinks?: {
      name: string;
      dataset_uuid: string;
    }[];
  };
}

export interface UpdateWorkspaceArgs extends APIAction {
  body: UpdateWorkspaceBody;
  workspaceId: number;
}

async function updateWorkspaceFetcher(
  _key: string,
  { arg: { body, url, headers, workspaceId } }: { arg: UpdateWorkspaceArgs },
) {
  trackEvent(
    {
      category: WorkspacesEventCategories.Workspaces,
      action: 'Update Workspace',
      value: {
        name: body?.name,
        files: body?.workspace_details?.files?.map((f) => f.name),
        symlinks: body?.workspace_details?.symlinks?.map((s) => s.name),
      },
    },
    workspaceId,
  );
  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers,
  });
  if (!response.ok) {
    console.error('Update workspace failed', response);
  }
  const responseJson = (await response.json()) as WorkspaceAPIResponseWithoutData;
  if (!responseJson.success) {
    throw new Error(`Failed to update workspace: ${responseJson.message}`);
  }
}

export function useUpdateWorkspace() {
  const api = useWorkspacesApiURLs();
  const headers = useWorkspaceHeaders();
  const { trigger, isMutating } = useSWRMutation('update-workspace', updateWorkspaceFetcher);

  const updateWorkspace = useCallback(
    ({ body, workspaceId }: { body: UpdateWorkspaceBody; workspaceId: number }) => {
      return trigger({
        url: api.workspace(workspaceId),
        body,
        headers,
        workspaceId,
      });
    },
    [trigger, api, headers],
  );

  return { updateWorkspace, isUpdatingWorkspace: isMutating };
}
