import React from 'react';
import { useCrossModalityResults } from './hooks';
import DatasetsTable from '../DatasetsTable';
import { useAugmentedResults } from '../MolecularDataQueryResults/hooks';

export default function CrossModalityGeneOrProteinResults<T extends 'gene' | 'protein'>() {
  const { data } = useCrossModalityResults<T>();

  const augmentedResults = useAugmentedResults(data?.list);

  return <DatasetsTable datasets={augmentedResults.list} />;
}
