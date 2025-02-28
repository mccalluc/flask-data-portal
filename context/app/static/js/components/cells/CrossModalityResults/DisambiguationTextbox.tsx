import React from 'react';
import { Alert } from 'js/shared-styles/alerts';
import AlertTitle from '@mui/material/AlertTitle';
import { useAllCellTypeNames } from './hooks';

interface DisambiguationTextboxProps {
  cellName: string;
}

export function DisambiguationTextbox({ cellName }: DisambiguationTextboxProps) {
  const { cellTypeNames, error } = useAllCellTypeNames(cellName);

  if (error) {
    return <div>Error loading cell type names for {cellName}.</div>;
  }

  if (!cellTypeNames || cellTypeNames.length < 2) {
    return null;
  }

  return (
    <Alert severity="info" $marginTop={8} $marginBottom={8}>
      <AlertTitle>
        The selected cell type ({cellName}) corresponds to the following terms in Azimuth annotations:
      </AlertTitle>
      <ul>
        {cellTypeNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </Alert>
  );
}
