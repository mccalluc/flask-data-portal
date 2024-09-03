import { create, StoreApi } from 'zustand';
import { Workspace } from 'js/components/workspaces/types';

export type DialogType =
  | 'UPDATE_TEMPLATES'
  | 'UPDATE_NAME'
  | 'ADD_DATASETS'
  | 'ADD_DATASETS_FROM_SEARCH'
  | 'LAUNCH_NEW_WORKSPACE'
  | null;

interface WorkspaceStore {
  isOpen: boolean;
  workspace: Workspace | null;
  dialogType: DialogType;
  open: () => void;
  close: () => void;
  setWorkspace: (workspace: Workspace) => void;
  reset: () => void;
  setDialogType: (dialogType: DialogType) => void;
}

const storeDefinition = (set: StoreApi<WorkspaceStore>['setState']) => ({
  isOpen: false,
  workspace: null,
  dialogType: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setWorkspace: (workspace: Workspace) => set({ workspace }),
  reset: () => set({ isOpen: false, workspace: null }),
  setDialogType: (dialogType: DialogType) => set({ dialogType }),
});

export const useLaunchWorkspaceStore = create<WorkspaceStore>(storeDefinition);
export const useEditWorkspaceStore = create<WorkspaceStore>(storeDefinition);
