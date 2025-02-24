import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { queryTypes } from 'js/components/cells/queryTypes';
import { useMolecularDataQueryFormState } from './hooks';
import { FormFieldContainer, FormFieldSubtitle } from './FormField';

function QueryType() {
  const { register, watch } = useMolecularDataQueryFormState();
  return (
    <FormFieldContainer title="Query Type">
      <FormFieldSubtitle>
        Choose to retrieve gene, protein or cell type data. Gene and cell type data will have a selection of methods to
        choose from, while protein data will be retrieved with the Cells Cross-Modality method.
      </FormFieldSubtitle>
      <TextField
        id="query-select"
        label="Query Type"
        variant="outlined"
        select
        fullWidth
        {...register('queryType')}
        value={watch('queryType')}
      >
        {Object.values(queryTypes).map((type) => (
          <MenuItem value={type.value} key={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </TextField>
    </FormFieldContainer>
  );
}

export default QueryType;
