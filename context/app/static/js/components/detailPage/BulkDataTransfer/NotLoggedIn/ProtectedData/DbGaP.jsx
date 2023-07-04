import React from 'react';
import Typography from '@material-ui/core/Typography';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';

import { DetailSectionPaper } from 'js/shared-styles/surfaces';
import { SecondaryBackgroundTooltip } from 'js/shared-styles/tooltips';
import { Header } from './style';

function GlobusAccess() {
  return (
    <DetailSectionPaper>
      <Header variant="h5">
        Non-Consortium Members: Database of Genotypes and Phenotypes (dbGaP)
        <CheckCircleIcon style={{ color: '#6c8938' }} />
        <SecondaryBackgroundTooltip title="The database of Genotypes and Phenotypes archive and distribute data and results from studies that have investigated the interaction of genotype and phenotype in humans">
          <InfoIcon />
        </SecondaryBackgroundTooltip>
      </Header>
      <Typography variant="body2">
        This dataset contains protected-access human sequence data. If you are not a Consortium meber, you must access
        these data through dbGaP if available. dbGaP authentication is required for downloading through these links.
        View <a href="/">documentation</a> on how to attain dbGaP access.
      </Typography>
    </DetailSectionPaper>
  );
}

export default GlobusAccess;
