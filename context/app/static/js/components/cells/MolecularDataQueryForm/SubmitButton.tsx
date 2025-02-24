import React from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { useCellVariableNames, useMolecularDataQueryFormState } from './hooks';

export default function SubmitButton() {
  const cellVariableNames = useCellVariableNames();
  const {
    formState: { isSubmitting },
  } = useMolecularDataQueryFormState();
  return (
    <LoadingButton
      disabled={cellVariableNames.length === 0 || isSubmitting}
      loading={isSubmitting}
      variant="contained"
      color="primary"
      id="run-query-button"
      type="submit"
      sx={{
        maxWidth: 'fit-content',
      }}
    >
      Run Query
    </LoadingButton>
  );
}
