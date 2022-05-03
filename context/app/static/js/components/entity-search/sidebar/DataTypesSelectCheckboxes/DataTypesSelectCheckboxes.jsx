import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

function DataTypesSelectCheckboxes({ values, eventHandler }) {
  return values.map((value) => (
    <FormControlLabel
      key={value}
      value={value}
      control={<Checkbox color="primary" size="small" onClick={(event) => eventHandler(event, value)} />}
      label={value}
    />
  ));
}

export default DataTypesSelectCheckboxes;
