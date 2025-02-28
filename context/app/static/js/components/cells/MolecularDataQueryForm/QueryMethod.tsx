import React from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import OutboundIconLink from 'js/shared-styles/Links/iconLinks/OutboundIconLink';
import { useMolecularDataQueryFormState } from './hooks';
import { FormFieldContainer, FormFieldSubtitle } from './FormField';

const queryMethods = {
  gene: [
    { value: 'scFind', label: 'scFind - RNAseq experiments (gene expression)' },
    { value: 'crossModalityRNA', label: 'Cells Cross-Modality - RNAseq experiments (gene expression)' },
    { value: 'crossModalityATAC', label: 'Cells Cross-Modality - ATACseq experiments (DNA accessibility)' },
  ],
  'cell-type': [
    { value: 'scFind', label: 'scFind (RNASeq)' },
    { value: 'crossModality', label: 'Cells Cross-Modality' },
  ],
  protein: undefined,
};

const scFindLink = <OutboundIconLink href="https://doi.org/10.1038/s41592-021-01076-9">scFind</OutboundIconLink>;

const description = {
  gene: (
    <>
      Choose the query method to retrieve data. {scFindLink} is tailored for RNAseq analyses, while Cells Cross-Modality
      supports RNAseq and ATACseq datasets.
    </>
  ),
  'cell-type': (
    <>
      Choose the query method to retrieve data. {scFindLink} is tailored for RNAseq analyses, while Cells Cross-Modality
      supports RNAseq, ATACseq and proteomic datasets.
    </>
  ),
  protein: undefined,
};

function ProteinQueryMethod() {
  return (
    <FormFieldContainer title="Query Method">
      <FormFieldSubtitle>Protein queries currently only support the Cells Cross-Modality method.</FormFieldSubtitle>
    </FormFieldContainer>
  );
}

export default function QueryMethod() {
  const { watch, register } = useMolecularDataQueryFormState();

  const queryType = watch('queryType');

  if (queryType === 'protein') {
    return <ProteinQueryMethod />;
  }

  if (!queryMethods[queryType] || !description[queryType]) {
    return null;
  }

  return (
    <FormFieldContainer title="Query Method">
      <FormFieldSubtitle>{description[queryType]}</FormFieldSubtitle>
      <TextField
        id="query-method-select"
        label="Query Method"
        variant="outlined"
        select
        fullWidth
        value={watch('queryMethod')}
        {...register('queryMethod')}
        defaultValue=""
        slotProps={{
          select: {
            MenuProps: {
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
              },
            },
          },
        }}
      >
        {queryMethods[queryType].map((method) => (
          <MenuItem value={method.value} key={method.value}>
            {method.label}
          </MenuItem>
        ))}
      </TextField>
    </FormFieldContainer>
  );
}
