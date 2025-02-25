import { useEffect, useMemo, useState } from 'react';
import { WorkspaceWithUserId } from 'js/components/workspaces/types';
import { TableFilter } from 'js/components/workspaces/Tables/WorkspaceItemsTable/types';

function useWorkspacesTable(workspacesList: WorkspaceWithUserId[]) {
  const { ownCount, sharedCount } = useMemo(() => {
    const own = workspacesList.filter((workspace) => !workspace.user_id).length;
    return { ownCount: own, sharedCount: workspacesList.length - own };
  }, [workspacesList]);

  const [showOwn, setShowOwn] = useState(true);
  const [showShared, setShowShared] = useState(true);

  useEffect(() => {
    setShowShared(sharedCount > 0);
  }, [sharedCount]);

  const filteredWorkspaces = useMemo(
    () =>
      [...workspacesList].filter((workspace) => {
        return (showOwn && !workspace.user_id) || (showShared && !!workspace.user_id);
      }),
    [workspacesList, showOwn, showShared],
  );

  const filters: TableFilter[] = useMemo(
    () => [
      {
        label: `Created by Me (${ownCount})`,
        setShow: setShowOwn,
        show: showOwn,
        disabled: !ownCount,
      },
      {
        label: `Created by Other (${sharedCount})`,
        setShow: setShowShared,
        show: showShared,
        disabled: !sharedCount,
      },
    ],
    [ownCount, sharedCount, showOwn, showShared],
  );

  return {
    filteredWorkspaces,
    filters,
  };
}

export default useWorkspacesTable;
