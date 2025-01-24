import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { useSavedListsAlertsStore, SavedListsSuccessAlertType } from 'js/stores/useSavedListsAlertsStore';
import { useTrackEntityPageEvent } from 'js/components/detailPage/useTrackEntityPageEvent';
import { useSavedLists } from 'js/components/savedLists/hooks';

interface SaveEntityButtonProps extends ButtonProps {
  uuid: string;
}

function SaveEntityButton({ uuid, ...rest }: SaveEntityButtonProps) {
  const { saveEntity } = useSavedLists();
  const setSuccessAlert = useSavedListsAlertsStore((state) => state.setSuccessAlert);
  const trackSave = useTrackEntityPageEvent();

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => {
        saveEntity(uuid);
        trackSave({ action: 'Save To List', label: uuid });
        setSuccessAlert(SavedListsSuccessAlertType.Saved);
      }}
      {...rest}
    >
      Save
    </Button>
  );
}

export default SaveEntityButton;
