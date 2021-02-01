import React from 'react';
import Typography from '@material-ui/core/Typography';

import useSavedEntitiesStore from 'js/stores/useSavedEntitiesStore';
import LocalStorageDescription from 'js/components/savedLists/LocalStorageDescription';
import DetailDescription from 'js/components/Detail/DetailDescription';
import RightAlignedButtonRow from 'js/shared-styles/sections/RightAlignedButtonRow';
import SavedListMenuButton from 'js/components/savedLists/SavedListMenuButton';

const usedSavedEntitiesSelector = (state) => ({
  savedLists: state.savedLists,
  savedEntities: state.savedEntities,
});

function getListAndItsEntities(savedLists, listTitle) {
  const list = savedLists[listTitle];
  const listEntities = { ...list.Donor, ...list.Sample, ...list.Dataset };
  return [list, listEntities];
}

function SavedList({ listTitle }) {
  const decodedTitle = decodeURIComponent(listTitle);

  const { savedLists } = useSavedEntitiesStore(usedSavedEntitiesSelector);
  const [savedList, listEntities] = getListAndItsEntities(savedLists, decodedTitle);
  return (
    <>
      <Typography variant="subtitle1" component="h1" color="primary">
        List
      </Typography>
      <Typography variant="h2">{decodedTitle}</Typography>
      <RightAlignedButtonRow
        leftText={
          <Typography variant="body1" color="primary">
            {Object.keys(listEntities).length}
          </Typography>
        }
        buttons={<SavedListMenuButton listTitle={decodedTitle} />}
      />
      <LocalStorageDescription />
      <DetailDescription
        description={savedList.description}
        createdTimestamp={savedList.dateSaved}
        modifiedTimestamp={savedList.dateLastModified}
      />
    </>
  );
}

export default SavedList;
