import { create, StoreApi } from 'zustand';

export enum SavedListsSuccessAlertType {
  Saved = 'Saved',
  Updated = 'Updated',
  Deleted = 'Deleted',
}
export interface SavedListsAlertsState {
  transferredToProfileAlert: boolean;
  setTransferredToProfileAlert: (transferredToProfileAlert: boolean) => void;
  successAlert?: SavedListsSuccessAlertType;
  setSuccessAlert: (val: SavedListsSuccessAlertType | undefined) => void;
}

const storeDefinition = (set: StoreApi<SavedListsAlertsState>['setState']) => ({
  transferredToProfileAlert: false,
  setTransferredToProfileAlert: (transferredToProfileAlert: boolean) => set({ transferredToProfileAlert }),
  successAlert: undefined,
  setSuccessAlert: (val: SavedListsSuccessAlertType | undefined) => set({ successAlert: val }),
});

export const useSavedListsAlertsStore = create<SavedListsAlertsState>(storeDefinition);
