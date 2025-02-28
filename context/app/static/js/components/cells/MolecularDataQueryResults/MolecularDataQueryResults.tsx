import React from 'react';

import CrossModalityCellTypeResults from '../CrossModalityResults';
import { useMolecularDataQueryFormState } from '../MolecularDataQueryForm/hooks';
import LoadingResults from './LoadingResults';
import CrossModalityGeneOrProteinResults from '../CrossModalityResults/CrossModalityGeneOrProteinResults';

function CellsResults() {
  const {
    formState: { isLoading, isSubmitting, isSubmitted },
    watch,
  } = useMolecularDataQueryFormState();

  const queryType = watch('queryType');
  const queryMethod = watch('queryMethod');

  // If the form has not been submitted, do not show any results
  if (!isSubmitted) {
    return null;
  }

  // // If the form has been submitted, but the form is dirty, show an alert to resubmit the query
  // if (isDirty) {
  //   return <FullWidthAlert severity="info">Please resubmit your query to view results.</FullWidthAlert>;
  // }

  // If the results are loading, show a loading spinner and message
  if (isLoading || isSubmitting) {
    return <LoadingResults />;
  }

  switch (queryType) {
    case 'gene':
      if (queryMethod === 'scFind') {
        return 'SCFIND GENE QUERY';
      }
      return <CrossModalityGeneOrProteinResults />;

    case 'protein':
      return <CrossModalityGeneOrProteinResults />;
    case 'cell-type':
      if (queryMethod === 'crossModality') {
        return <CrossModalityCellTypeResults />;
      }
      return 'SCFIND CELL-TYPE QUERY';
    default:
      return `Unknown query type/method: ${queryType as string} with ${queryMethod}`;
  }
}

export default CellsResults;
