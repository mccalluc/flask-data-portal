import { useCallback, useMemo } from 'react';
import { mergeJobsIntoWorkspaces } from './utils';
import {
  useCreateAndLaunchWorkspace,
  useDeleteWorkspace,
  useStopWorkspace,
  useStartWorkspace,
  useWorkspaces,
  useJobs,
} from './api';
import { MergedWorkspace } from './types';

function useWorkspacesList() {
  const { workspaces, isLoading: workspacesLoading, mutate: mutateWorkspaces } = useWorkspaces();
  const { jobs, isLoading: jobsLoading, mutate: mutateJobs } = useJobs();
  const isLoading = workspacesLoading || jobsLoading;
  const mutate = useCallback(async () => {
    await Promise.all([mutateWorkspaces(), mutateJobs()]);
  }, [mutateWorkspaces, mutateJobs]);

  const workspacesList: MergedWorkspace[] = useMemo(
    () => (jobs?.length && workspaces?.length ? mergeJobsIntoWorkspaces(jobs, workspaces) : []),
    [jobs, workspaces],
  );

  const { deleteWorkspace, isDeleting } = useDeleteWorkspace();
  const { stopWorkspace, isStoppingWorkspace } = useStopWorkspace();
  const { createAndLaunchWorkspace, isCreatingWorkspace } = useCreateAndLaunchWorkspace();
  const { startWorkspace, isStartingWorkspace } = useStartWorkspace();

  async function handleDeleteWorkspace(workspaceId: number) {
    await deleteWorkspace(workspaceId);
    await mutate();
  }

  async function handleStopWorkspace(workspaceId: number) {
    await stopWorkspace(workspaceId);
    await mutate();
  }

  async function handleCreateWorkspace({ workspaceName }: { workspaceName: string }) {
    await createAndLaunchWorkspace({ path: 'blank.ipynb', body: { workspace_name: workspaceName } });
    await mutate();
  }

  async function handleStartWorkspace(workspaceId: number) {
    await startWorkspace(workspaceId);
    await mutate();
  }

  return {
    workspacesList,
    handleDeleteWorkspace,
    handleCreateWorkspace,
    handleStopWorkspace,
    handleStartWorkspace,
    isLoading,
    isDeleting,
    isStoppingWorkspace,
    isCreatingWorkspace,
    isStartingWorkspace,
  };
}

export { useWorkspacesList };
