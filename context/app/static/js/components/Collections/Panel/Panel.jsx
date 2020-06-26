/* eslint-disable react/no-array-index-key */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { PanelWrapper, Name } from './style';

function Panel(props) {
  const { name, doi_id, dataset_uuids } = props;
  return (
    <PanelWrapper>
      <div>
        <Name variant="subtitle1" component="h3">
          {name}
        </Name>
        <Typography variant="body2" color="secondary">
          {doi_id}
        </Typography>
      </div>
      <Typography variant="caption">{dataset_uuids.length} Datasets</Typography>
    </PanelWrapper>
  );
}

export default Panel;
