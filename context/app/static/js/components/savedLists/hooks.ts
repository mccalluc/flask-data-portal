import savedEntitiesStoreInitializer from 'js/components/savedLists/SavedEntitiesStoreInitializer';
import { useAppContext } from 'js/components/Contexts';
import { SavedEntitiesList, SavedEntitiesStore, SavedEntity } from 'js/components/savedLists/types';
import { fetcher } from 'js/helpers/swr/fetchers';
import { v4 as uuidv4 } from 'uuid';
import useSWR from 'swr';
import { useEffect, useRef } from 'react';
import { createImmer, createImmerPersist } from 'js/helpers/zustand/middleware';
import { useSavedListsAlerts } from 'js/stores/useSavedListsAlertsStore';

const savedEntitiesSelector = (state: SavedEntitiesStore) => ({
  savedLists: state.savedLists,
  savedEntities: state.savedEntities,
  listsToBeDeleted: state.listsToBeDeleted,
  setEntities: state.setEntities,
  setLists: state.setLists,
  saveEntity: state.saveEntity,
  saveEntities: state.saveEntities,
  deleteEntity: state.deleteEntity,
  deleteEntities: state.deleteEntities,
  createList: state.createList,
  addEntityToList: state.addEntityToList,
  addEntitiesToList: state.addEntitiesToList,
  removeEntityFromList: state.removeEntityFromList,
  removeEntitiesFromList: state.removeEntitiesFromList,
  queueListToBeDeleted: state.queueListToBeDeleted,
  deleteQueuedLists: state.deleteQueuedLists,
  deleteList: state.deleteList,
  editList: state.editList,
});

const savedEntitiesDefaultObject = {
  title: 'My Saved Items',
  description: '',
  dateSaved: Date.now(),
  dateLastModified: Date.now(),
};

/**
 * Generates API URLs for various saved list API actions
 * @param ukvEndpoint endpoint to use as the base for API URLs
 * @returns an API URL generator
 */
const apiUrls = (ukvEndpoint: string) => ({
  get keys(): string {
    return `${ukvEndpoint}/user/keys`;
  },
  get findKeys(): string {
    return `${ukvEndpoint}/user/find/keys`;
  },
  key(key: string): string {
    return `${ukvEndpoint}/user/keys/${key}`;
  },
});

function useUkvApiURLs() {
  const { ukvEndpoint } = useAppContext();
  return apiUrls(ukvEndpoint);
}

async function sendResponse({
  url,
  token,
  method,
  body,
}: {
  url: string;
  token: string;
  method: 'PUT' | 'DELETE';
  body?: string;
}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    console.error('Error: ', await response.text());
  }
}

interface RemoteEntitiesProps {
  urls: ReturnType<typeof apiUrls>;
  groupsToken: string;
  savedEntities?: Record<string, SavedEntity>;
  savedLists?: Record<string, SavedEntitiesList>;
}

// REMOTE FUNCTIONS

function useFetchSavedEntitiesAndLists({ urls, groupsToken }: RemoteEntitiesProps) {
  const { data, isLoading } = useSWR([urls.keys, groupsToken], ([url, token]: string[]) =>
    fetcher<{ key: string; value: SavedEntitiesList }[]>({
      url,
      requestInit: { headers: { Authorization: `Bearer ${token}` } },
    }),
  );

  let savedEntities: Record<string, SavedEntity> = {};
  let savedLists: Record<string, SavedEntitiesList> = {};
  let isFirstRemoteFetch = false;

  if (!isLoading) {
    if (!data) {
      isFirstRemoteFetch = true;
    } else {
      const savedEntitiesObject = data.find((item) => item.key === 'savedEntities');

      if (savedEntitiesObject) {
        savedEntities = savedEntitiesObject.value.savedEntities;
      }

      savedLists = data
        .filter((item) => item.key !== 'savedEntities')
        .reduce((acc, item) => {
          return {
            ...acc,
            [item.key]: item.value,
          };
        }, {});
    }
  }

  return { savedLists, savedEntities, isFirstRemoteFetch, isLoading };
}

function CopySavedItemsToRemoteStore({
  urls,
  groupsToken,
  savedEntitiesLocal,
  savedListsLocal,
}: RemoteEntitiesProps & {
  savedEntitiesLocal: Record<string, SavedEntity>;
  savedListsLocal: Record<string, SavedEntitiesList>;
}) {
  const entitiesUrl = urls.key('savedEntities');
  const entitiesBody = JSON.stringify({
    title: 'Saved Entities',
    description: 'Entities saved by the user',
    dateSaved: Date.now(),
    dateModified: Date.now(),
    savedEntities: savedEntitiesLocal,
  });

  sendResponse({ url: entitiesUrl, token: groupsToken, method: 'PUT', body: entitiesBody }).catch((err) =>
    console.error('Failed to copy saved entities to remote store:', err),
  );

  // Send each saved list to the remote store
  Object.entries(savedListsLocal).forEach(([key, list]) => {
    const listUrl = urls.key(key);
    const listBody = JSON.stringify(list);

    sendResponse({ url: listUrl, token: groupsToken, method: 'PUT', body: listBody }).catch((err) =>
      console.error(`Failed to copy saved list "${key}" to remote store:`, err),
    );
  });
}

function saveEntitiesRemote({
  urls,
  groupsToken,
  savedEntities,
  entityUUIDs,
}: RemoteEntitiesProps & { entityUUIDs: Set<string> }) {
  const savedEntitiesCopy = { ...savedEntities };
  entityUUIDs.forEach((entityUUID) => {
    savedEntitiesCopy[entityUUID] = {
      dateSaved: Date.now(),
      dateAddedToList: Date.now(),
    };
  });

  const url = urls.key('savedEntities');
  const body = JSON.stringify({
    title: 'Saved Entities',
    description: 'Entities saved by the user',
    dateSaved: Date.now(),
    dateModified: Date.now(),
    savedEntities: savedEntitiesCopy,
  });

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

function saveEntityRemote({ entityUUID, ...props }: RemoteEntitiesProps & { entityUUID: string }) {
  return saveEntitiesRemote({ ...props, entityUUIDs: new Set([entityUUID]) });
}

function deleteEntitiesRemote({
  urls,
  groupsToken,
  savedEntities,
  entityUUIDs,
}: RemoteEntitiesProps & { entityUUIDs: Set<string> }) {
  const savedEntitiesCopy = { ...savedEntities };
  entityUUIDs.forEach((uuid) => {
    delete savedEntitiesCopy[uuid];
  });

  const url = urls.key('savedEntities');
  const body = JSON.stringify({
    title: 'Saved Entities',
    description: 'Entities saved by the user',
    dateSaved: Date.now(),
    dateModified: Date.now(),
    savedEntities: savedEntitiesCopy,
  });

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

function deleteEntityRemote({ entityUUID, ...props }: RemoteEntitiesProps & { entityUUID: string }) {
  return deleteEntitiesRemote({
    entityUUIDs: new Set([entityUUID]),
    ...props,
  });
}

function createListRemote({
  urls,
  groupsToken,
  list,
}: {
  urls: { key: (uuid: string) => string };
  groupsToken: string;
  list: Pick<SavedEntitiesList, 'title' | 'description'>;
}) {
  const uuid = uuidv4();

  const url = urls.key(uuid);
  const body = JSON.stringify({
    ...list,
    dateSaved: Date.now(),
    dateLastModified: Date.now(),
    savedEntities: {},
  });

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

function addEntitiesToListRemote({
  urls,
  groupsToken,
  savedLists,
  listUUID,
  entityUUIDs,
}: RemoteEntitiesProps & { savedLists: Record<string, SavedEntitiesList>; listUUID: string; entityUUIDs: string[] }) {
  const updatedSavedEntities = { ...savedLists[listUUID].savedEntities };
  entityUUIDs.forEach((uuid) => {
    updatedSavedEntities[uuid] = {
      dateAddedToList: Date.now(),
    };
  });

  const updatedList = {
    ...savedLists[listUUID],
    savedEntities: updatedSavedEntities,
    dateLastModified: Date.now(),
  };

  const url = urls.key(listUUID);
  const body = JSON.stringify(updatedList);

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

function addEntityToListRemote({
  entityUUID,
  ...props
}: RemoteEntitiesProps & { savedLists: Record<string, SavedEntitiesList>; listUUID: string; entityUUID: string }) {
  return addEntitiesToListRemote({ ...props, entityUUIDs: [entityUUID] });
}

function deleteListRemote({ urls, groupsToken, listUUID }: RemoteEntitiesProps & { listUUID: string }) {
  const url = urls.key(listUUID);
  return sendResponse({ url, token: groupsToken, method: 'DELETE' });
}

function removeEntitiesFromListRemote({
  urls,
  groupsToken,
  savedLists,
  listUUID,
  entityUUIDs,
}: RemoteEntitiesProps & { savedLists: Record<string, SavedEntitiesList>; listUUID: string; entityUUIDs: string[] }) {
  const updatedSavedEntities = { ...savedLists[listUUID].savedEntities };
  entityUUIDs.forEach((uuid) => {
    delete updatedSavedEntities[uuid];
  });

  const updatedList = {
    ...savedLists[listUUID],
    savedEntities: updatedSavedEntities,
    dateLastModified: Date.now(),
  };

  const url = urls.key(listUUID);
  const body = JSON.stringify(updatedList);

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

function removeEntityFromListRemote({
  entityUUID,
  ...props
}: RemoteEntitiesProps & { savedLists: Record<string, SavedEntitiesList>; listUUID: string; entityUUID: string }) {
  return removeEntitiesFromListRemote({ ...props, entityUUIDs: [entityUUID] });
}

function editListRemote({
  urls,
  groupsToken,
  savedLists,
  listUUID,
  title,
  description,
}: RemoteEntitiesProps & {
  savedLists: Record<string, SavedEntitiesList>;
  listUUID: string;
  title: string;
  description: string;
}) {
  savedLists[listUUID] = {
    ...savedLists[listUUID],
    title,
    description,
    dateLastModified: Date.now(),
  };

  const url = urls.key(listUUID);
  const body = JSON.stringify(savedLists[listUUID]);

  return sendResponse({ url, token: groupsToken, method: 'PUT', body });
}

// Main exported hook

const useLocalSavedEntitiesStore = createImmerPersist<SavedEntitiesStore>(savedEntitiesStoreInitializer, {
  name: 'local_saved_entities',
});
const useRemoteSavedEntitiesStore = createImmer<SavedEntitiesStore>(savedEntitiesStoreInitializer);

function useSavedLists() {
  const urls = useUkvApiURLs();
  const { groupsToken, isAuthenticated } = useAppContext();
  const { setTransferredToProfile } = useSavedListsAlerts();
  const { savedEntities, savedLists, isFirstRemoteFetch, isLoading } = useFetchSavedEntitiesAndLists({
    urls,
    groupsToken,
  });

  const localStore = useLocalSavedEntitiesStore(savedEntitiesSelector);
  const remoteStore = useRemoteSavedEntitiesStore(savedEntitiesSelector);
  const store = isAuthenticated ? remoteStore : localStore;

  const storeHasBeenSetRef = useRef(false);
  const wasLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !wasLoadingRef.current) {
      return;
    }

    if (isFirstRemoteFetch) {
      // If a user logs into their account for the first time since the My Lists update
      // on a device that has saved entities and lists, we copy those to their remote store and show them an alert.
      // This only happens once.
      setTransferredToProfile(true);
      const { savedEntities: savedEntitiesLocal, savedLists: savedListsLocal } = useLocalSavedEntitiesStore.getState();

      CopySavedItemsToRemoteStore({ savedEntitiesLocal, savedListsLocal, urls, groupsToken });
      store.setEntities(savedEntitiesLocal);
      store.setLists(savedListsLocal);
    } else {
      // If the user already has saved entities and lists in their remote store, we need to copy those over to the local store.
      store.setEntities(savedEntities);
      store.setLists(savedLists);
    }
    storeHasBeenSetRef.current = true;
    wasLoadingRef.current = isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  const params = { urls, groupsToken, savedEntities, savedLists };

  const handleStoreOperation = async <T>(remoteOperation: () => Promise<T>, localOperation: () => void) => {
    if (isAuthenticated) {
      await remoteOperation();
      localOperation();
    } else {
      localOperation();
    }
  };

  return {
    ...store,
    saveEntity: (entityUUID: string) => {
      handleStoreOperation(
        () => saveEntityRemote({ ...params, entityUUID }),
        () => store.saveEntity(entityUUID),
      ).catch((err) => console.error('Failed to save entity:', err));
    },
    saveEntities: (entityUUIDs: Set<string>) => {
      handleStoreOperation(
        () => saveEntitiesRemote({ ...params, entityUUIDs }),
        () => store.saveEntities(entityUUIDs),
      ).catch((err) => console.error('Failed to save entity:', err));
    },
    deleteEntity: (entityUUID: string) => {
      handleStoreOperation(
        () => deleteEntityRemote({ ...params, entityUUID }),
        () => store.deleteEntity(entityUUID),
      ).catch((err) => console.error('Failed to delete entity:', err));
    },
    deleteEntities: (entityUUIDs: Set<string>) => {
      handleStoreOperation(
        () => deleteEntitiesRemote({ ...params, entityUUIDs }),
        () => store.deleteEntities(entityUUIDs),
      ).catch((err) => console.error('Failed to delete entities:', err));
    },
    createList: (list: Pick<SavedEntitiesList, 'title' | 'description'>) => {
      handleStoreOperation(
        () => createListRemote({ ...params, list }),
        () => store.createList(list),
      ).catch((err) => console.error('Failed to create list:', err));
    },
    addEntityToList: (listUUID: string, entityUUID: string) => {
      handleStoreOperation(
        () => addEntityToListRemote({ ...params, listUUID, entityUUID }),
        () => store.addEntityToList(listUUID, entityUUID),
      ).catch((err) => console.error('Failed to add entity to list:', err));
    },
    addEntitiesToList: (listUUID: string, entityUUIDs: string[]) => {
      handleStoreOperation(
        () => addEntitiesToListRemote({ ...params, listUUID, entityUUIDs }),
        () => store.addEntitiesToList(listUUID, entityUUIDs),
      ).catch((err) => console.error('Failed to add entity to list:', err));
    },
    removeEntityFromList: (listUUID: string, entityUUID: string) => {
      handleStoreOperation(
        () => removeEntityFromListRemote({ ...params, listUUID, entityUUID }),
        () => store.removeEntityFromList(listUUID, entityUUID),
      ).catch((err) => console.error('Failed to remove entity from list:', err));
    },
    removeEntitiesFromList: (listUUID: string, entityUUIDs: string[]) => {
      handleStoreOperation(
        () => removeEntitiesFromListRemote({ ...params, listUUID, entityUUIDs }),
        () => store.removeEntitiesFromList(listUUID, entityUUIDs),
      ).catch((err) => console.error('Failed to remove entities from list:', err));
    },
    queueListToBeDeleted: (listUUID: string) => {
      handleStoreOperation(
        () => deleteListRemote({ ...params, listUUID }),
        () => store.queueListToBeDeleted(listUUID),
      ).catch((err) => console.error('Failed to queue list for deletion:', err));
    },
    deleteQueuedLists: () => {
      store.deleteQueuedLists();
    },
    editList: ({ title, description, listUUID }: { title: string; description: string; listUUID: string }) => {
      handleStoreOperation(
        () => editListRemote({ ...params, title, description, listUUID }),
        () => store.editList({ title, description, listUUID }),
      ).catch((err) => console.error('Failed to edit list:', err));
    },
  };
}

function useSavedListsAndEntities() {
  const { savedLists, savedEntities } = useSavedLists();

  const savedListsAndEntities: Record<string, SavedEntitiesList> = {
    savedEntities: {
      ...savedEntitiesDefaultObject,
      savedEntities,
    },
    ...savedLists,
  };

  return {
    savedListsAndEntities,
  };
}

export { useSavedLists, useSavedListsAndEntities };
