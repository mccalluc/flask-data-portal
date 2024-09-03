import { useCallback, useMemo } from 'react';
import { KeyedMutator, useSWRConfig } from 'swr';

import { useSnackbarActions } from 'js/shared-styles/snackbars';
import { useLaunchWorkspaceStore } from 'js/stores/useWorkspaceModalStore';
import { useAppContext } from 'js/components/Contexts';
import { multiFetcher } from 'js/helpers/swr';
import {
  getWorkspaceStartLink,
  mergeJobsIntoWorkspaces,
  findBestJob,
  getWorkspaceFileName,
  buildDatasetSymlinks,
  getDefaultJobType,
  getWorkspaceResourceOptions,
} from './utils';
import {
  useDeleteWorkspace,
  useStopWorkspace,
  useStartWorkspace,
  useWorkspaces,
  useJobs,
  useCreateWorkspace,
  CreateWorkspaceBody,
  useWorkspace,
  useUpdateWorkspace,
  UpdateWorkspaceBody,
  useWorkspacesApiURLs,
  useBuildWorkspacesSWRKey,
} from './api';
import { MergedWorkspace, Workspace, CreateTemplatesResponse, WorkspaceResourceOptions } from './types';
import { useWorkspaceTemplates } from './NewWorkspaceDialog/hooks';
import WorkspaceLaunchSuccessToast from './WorkspaceLaunchSuccessToast';

interface UseWorkspacesListTypes<T> {
  workspaces: Workspace[];
  workspacesLoading: boolean;
  mutateWorkspace?: KeyedMutator<T>;
}

/**
 * Returns a function that will mutate workspaces, jobs, and optionally a single workspace's details
 *
 * @param mutateWorkspace The mutate function for a single workspace
 * @returns A function that will revalidate workspaces, jobs, and optionally a workspace
 */
function useMutateWorkspacesAndJobs<T>(mutateWorkspace?: KeyedMutator<T>) {
  const { mutate: mutateJobs } = useJobs();
  const { mutate: mutateWorkspaces } = useWorkspaces();
  const mutate = useCallback(async () => {
    await Promise.all([mutateWorkspaces(), mutateJobs(), mutateWorkspace?.()]);
  }, [mutateWorkspaces, mutateJobs, mutateWorkspace]);

  return mutate;
}

function useGlobalMutateWorkspace() {
  const { buildKey } = useBuildWorkspacesSWRKey();
  const urls = useWorkspacesApiURLs();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (workspaceId: number) => {
      await mutate(buildKey({ url: urls.workspace(workspaceId) }));
    },
    [buildKey, urls, mutate],
  );
}

function useWorkspacesActions<T>({ workspaces, workspacesLoading, mutateWorkspace }: UseWorkspacesListTypes<T>) {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const isLoading = workspacesLoading || jobsLoading;
  const mutate = useMutateWorkspacesAndJobs(mutateWorkspace);

  const workspacesList: MergedWorkspace[] = useMemo(
    () => (jobs?.length && workspaces?.length ? mergeJobsIntoWorkspaces(jobs, workspaces) : []),
    [jobs, workspaces],
  );

  const { deleteWorkspace, isDeleting } = useDeleteWorkspace();
  const { stopWorkspace, isStoppingWorkspace } = useStopWorkspace();
  const { startWorkspace, isStartingWorkspace } = useStartWorkspace();

  async function handleDeleteWorkspace(workspaceId: number) {
    await deleteWorkspace(workspaceId);
    await mutate();
  }

  async function handleStopWorkspace(workspaceId: number) {
    await stopWorkspace(workspaceId);
    await mutate();
  }

  async function handleStartWorkspace({
    workspaceId,
    jobTypeId,
    resourceOptions,
  }: {
    workspaceId: number;
    jobTypeId: string;
    resourceOptions: WorkspaceResourceOptions;
  }) {
    await startWorkspace({ workspaceId, jobTypeId, resourceOptions });
    await mutate();
  }

  return {
    workspacesList,
    handleDeleteWorkspace,
    handleStopWorkspace,
    handleStartWorkspace,
    isLoading,
    isDeleting,
    isStoppingWorkspace,
    isStartingWorkspace,
  };
}

function useWorkspacesList() {
  const { workspaces, isLoading: workspacesLoading } = useWorkspaces();
  return useWorkspacesActions({
    workspaces,
    workspacesLoading,
  });
}

function getWorkspaceDatasetUUIDs(workspace: MergedWorkspace | Record<string, never> = {}) {
  // TODO: Update to use dataset IDs once workspace API makes them available
  const symlinks = workspace?.workspace_details?.current_workspace_details?.symlinks ?? [];
  return symlinks.reduce<string[]>((acc, symlink) => {
    const uuid = getWorkspaceFileName(symlink).split('/').pop();
    if (uuid) {
      return [...acc, uuid];
    }
    return acc;
  }, []);
}

function useMatchingWorkspaceTemplates(workspace: MergedWorkspace | Record<string, never> = {}) {
  // TODO: Update to use template IDs once workspace API makes them available
  const workspaceFiles = workspace?.workspace_details?.current_workspace_details?.files ?? [];
  const { templates } = useWorkspaceTemplates();

  const matchingTemplates = workspaceFiles.reduce((acc, file) => {
    // match the filename without extension given a file path.
    const regex = /[\w-]+?(?=\.)/;
    const fileNameMatch = getWorkspaceFileName(file).match(regex);
    const templateName = fileNameMatch ? fileNameMatch[0] : '';
    if (templateName && templateName in templates) {
      return { ...acc, [templateName]: templates[templateName] };
    }
    return acc;
  }, {});

  return matchingTemplates;
}

function useWorkspaceDetail({ workspaceId }: { workspaceId: number }) {
  const { workspace, isLoading: workspacesLoading } = useWorkspace(workspaceId);
  const { workspacesList, ...rest } = useWorkspacesActions({
    workspaces: Object.keys(workspace).length > 0 ? [workspace] : [],
    workspacesLoading,
  });

  const mergedWorkspace = workspacesList[0] ?? {};

  const workspaceTemplates = useMatchingWorkspaceTemplates(mergedWorkspace);

  return {
    workspace: mergedWorkspace,
    workspaceDatasets: getWorkspaceDatasetUUIDs(mergedWorkspace),
    workspaceTemplates,
    ...rest,
  };
}

function useRunningWorkspace() {
  const { workspacesList } = useWorkspacesList();
  return workspacesList.find((workspace) =>
    workspace.jobs.some((job) => job.status === 'running' || job.status === 'pending'),
  );
}

function useHasRunningWorkspace() {
  return Boolean(useRunningWorkspace());
}

function useHandleUpdateWorkspace() {
  const { updateWorkspace } = useUpdateWorkspace();
  const mutateWorkspacesAndJobs = useMutateWorkspacesAndJobs();
  const globalMutateWorkspace = useGlobalMutateWorkspace();

  const handleUpdateWorkspace = useCallback(
    async ({ body, workspaceId }: { body: UpdateWorkspaceBody; workspaceId: number }) => {
      try {
        await updateWorkspace({ body, workspaceId });
        await mutateWorkspacesAndJobs();
        await globalMutateWorkspace(workspaceId);
      } catch (e) {
        console.error(e);
      }
    },
    [updateWorkspace, mutateWorkspacesAndJobs, globalMutateWorkspace],
  );

  return { handleUpdateWorkspace };
}

function useLaunchWorkspace() {
  const { startWorkspace } = useStartWorkspace();
  const runningWorkspace = useRunningWorkspace();
  const mutateWorkspacesAndJobs = useMutateWorkspacesAndJobs();
  const globalMutateWorkspace = useGlobalMutateWorkspace();
  const { open, setWorkspace } = useLaunchWorkspaceStore();

  const { handleUpdateWorkspace } = useHandleUpdateWorkspace();

  const startAndOpenWorkspace = useCallback(
    async ({
      workspace,
      jobTypeId,
      resourceOptions,
      templatePath,
    }: {
      workspace: Workspace;
      jobTypeId: string;
      resourceOptions: WorkspaceResourceOptions;
      templatePath?: string;
    }) => {
      const isNewJobType = workspace?.default_job_type !== jobTypeId;

      if (runningWorkspace && workspace.id === runningWorkspace.id && !isNewJobType) {
        window.open(getWorkspaceStartLink(workspace, templatePath), '_blank');
        return;
      }

      await startWorkspace({ workspaceId: workspace.id, jobTypeId, resourceOptions });
      await mutateWorkspacesAndJobs();
      await globalMutateWorkspace(workspace.id);
      window.open(getWorkspaceStartLink(workspace, templatePath), '_blank');

      if (isNewJobType) {
        await handleUpdateWorkspace({ workspaceId: workspace.id, body: { default_job_type: jobTypeId } });
      }
    },
    [mutateWorkspacesAndJobs, startWorkspace, globalMutateWorkspace, handleUpdateWorkspace, runningWorkspace],
  );

  const startNewWorkspace = useCallback(
    async ({
      workspace,
      jobTypeId,
      resourceOptions,
      templatePath,
    }: {
      workspace: Workspace;
      jobTypeId: string;
      resourceOptions: WorkspaceResourceOptions;
      templatePath?: string;
    }) => {
      if (runningWorkspace) {
        open();
        setWorkspace(workspace);
      } else {
        await startAndOpenWorkspace({ workspace, jobTypeId, templatePath, resourceOptions });
        // setDialogType(null);
      }
    },
    [open, runningWorkspace, setWorkspace, startAndOpenWorkspace],
  );

  return { startNewWorkspace, startAndOpenWorkspace };
}

export function useCreateAndLaunchWorkspace() {
  const { createWorkspace, isCreatingWorkspace } = useCreateWorkspace();
  const { startNewWorkspace } = useLaunchWorkspace();
  const { toastError, toastSuccess } = useSnackbarActions();

  const createAndLaunchWorkspace = useCallback(
    async ({
      body,
      templatePath,
      resourceOptions,
    }: {
      body: CreateWorkspaceBody;
      templatePath: string;
      resourceOptions: WorkspaceResourceOptions;
    }) => {
      let workspace: Workspace;

      try {
        workspace = await createWorkspace(body);
      } catch (e) {
        toastError('Failed to create workspace.');
        return;
      }

      toastSuccess(WorkspaceLaunchSuccessToast(workspace.id));

      try {
        await startNewWorkspace({
          workspace,
          jobTypeId: body.default_job_type,
          templatePath,
          resourceOptions,
        });
      } catch (e) {
        toastError('Workspace failed to launch.');
      }
    },
    [createWorkspace, startNewWorkspace, toastError, toastSuccess],
  );

  return { createAndLaunchWorkspace, isCreatingWorkspace };
}

function getWorkspaceTimeLeft(workspace: MergedWorkspace) {
  return findBestJob(workspace?.jobs ?? [])?.job_details?.current_job_details?.time_left;
}

type FoundPair = [MergedWorkspace, number];

function useSessionWarning(workspaces: MergedWorkspace[]) {
  const result = workspaces.reduce<FoundPair | undefined>((acc, ws) => {
    if (acc) return acc; // Avoids extra calls to `getWorkspaceTimeLeft` after workspace has been found since we can't break a .reduce()
    const time = getWorkspaceTimeLeft(ws);
    return time ? [ws, time] : acc; // If a time is found, return the workspace with time, otherwise continue iteration
  }, undefined);

  if (!result) {
    return false;
  }

  const [matchedWorkspace, timeLeft] = result;

  const warning = `is currently running. You have ${Math.floor(
    timeLeft / 60,
  )} minutes left in your session. Renewing your session time will stop all jobs running in your workspace.`;

  return {
    warning,
    matchedWorkspace,
  };
}

function useRefreshSession(workspace: MergedWorkspace) {
  const { stopWorkspace, isStoppingWorkspace } = useStopWorkspace();
  const { startWorkspace, isStartingWorkspace } = useStartWorkspace();
  const { mutate: mutateWorkspace } = useWorkspace(workspace.id);
  const mutate = useMutateWorkspacesAndJobs(mutateWorkspace);
  const { toastSuccess } = useSnackbarActions();
  const refreshSession = useCallback(async () => {
    await stopWorkspace(workspace.id);
    await startWorkspace({
      workspaceId: workspace.id,
      jobTypeId: getDefaultJobType({ workspace }),
      resourceOptions: getWorkspaceResourceOptions(workspace),
    });
    await mutate();
    toastSuccess('Session time for workspace successfully renewed');
  }, [mutate, startWorkspace, stopWorkspace, toastSuccess, workspace]);

  return { refreshSession, isRefreshingSession: isStoppingWorkspace || isStartingWorkspace };
}

function useCreateTemplates() {
  const { userTemplatesEndpoint } = useAppContext();

  const createTemplates = useCallback(
    async ({ templateKeys, uuids }: { templateKeys: string[]; uuids: string[] }) => {
      const templateUrls = templateKeys.map((key) => `${userTemplatesEndpoint}/templates/jupyter_lab/${key}`);
      const createdTemplates = await multiFetcher<CreateTemplatesResponse>({
        urls: templateUrls,
        requestInits: [
          {
            method: 'POST',
            body: JSON.stringify({ uuids }),
            headers: { Authorization: `Bearer ${groupsToken}` },
          },
        ],
      });
      return templateKeys.map((templateKey, i) => ({
        name: `${templateKey}.ipynb`,
        content: createdTemplates[i]?.data?.template,
      }));
    },
    [userTemplatesEndpoint],
  );

  return { createTemplates };
}

function useUpdateWorkspaceDatasets({ workspaceId }: { workspaceId: number }) {
  const { groupsToken } = useAppContext();
  const { handleUpdateWorkspace } = useHandleUpdateWorkspace();

  return useCallback(
    async ({ datasetUUIDs }: { datasetUUIDs: string[] }) => {
      await handleUpdateWorkspace({
        workspaceId,
        body: {
          workspace_details: {
            globus_groups_token: groupsToken,
            symlinks: buildDatasetSymlinks({ datasetUUIDs }),
          },
        },
      });
    },
    [handleUpdateWorkspace, groupsToken, workspaceId],
  );
}

export {
  useWorkspacesList,
  useHasRunningWorkspace,
  useRunningWorkspace,
  useLaunchWorkspace,
  useWorkspaceDetail,
  useSessionWarning,
  useRefreshSession,
  useHandleUpdateWorkspace,
  useCreateTemplates,
  useUpdateWorkspaceDatasets,
};
