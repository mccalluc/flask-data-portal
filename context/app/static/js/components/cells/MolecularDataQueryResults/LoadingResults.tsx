import React from 'react';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { CenteredFlex } from './style';

export default function LoadingResults() {
  return (
    <CenteredFlex>
      <Typography>Please wait while your results are loading.</Typography>
      <CircularProgress />
    </CenteredFlex>
  );
}
