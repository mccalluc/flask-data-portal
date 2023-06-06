import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { trackEvent } from 'js/helpers/trackers';
import { Typography } from '@material-ui/core';

import { StyledCancelIcon, SelectedFilterDiv } from './style';

function SelectedFilter({ labelKey, labelValue, removeFilter, filterId, analyticsCategory }) {
  const onClickWithTracking = useCallback(
    function onClickWithTracking() {
      trackEvent({
        category: analyticsCategory,
        action: 'Unselect Facet Chip',
        label: `${labelKey}: ${labelValue}`,
      });
      removeFilter();
    },
    [analyticsCategory, labelKey, labelValue, removeFilter],
  );

  if (filterId === 'entity_type') {
    return null;
  }

  return (
    <SelectedFilterDiv>
      <Typography variant="body2">
        {labelKey}: {labelValue}
      </Typography>
      <StyledCancelIcon onClick={onClickWithTracking} />
    </SelectedFilterDiv>
  );
}

SelectedFilter.propTypes = {
  labelKey: PropTypes.string.isRequired,
  labelValue: PropTypes.string.isRequired,
  filterId: PropTypes.string.isRequired,
  removeFilter: PropTypes.func.isRequired,
};

export default SelectedFilter;
