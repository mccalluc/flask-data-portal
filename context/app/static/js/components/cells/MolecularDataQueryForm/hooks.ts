import { queryTypes } from 'js/components/cells/queryTypes';
import { useFormContext } from 'react-hook-form';
import { MolecularDataQueryFormState, QueryType } from './types';
import { AutocompleteResult } from './AutocompleteEntity/types';
import { GetDatasetsProps } from '../CellsService';

export function getCellVariableNames(
  queryType: string,
  genes: AutocompleteResult[],
  proteins: AutocompleteResult[],
  cellTypes: AutocompleteResult[],
) {
  switch (queryType) {
    case 'gene':
      return genes.map((g) => g.full);
    case 'protein':
      return proteins.map((p) => p.full);
    case 'cell-type':
      return cellTypes.map((c) => c.full);
    default:
      return [];
  }
}

export function useCellVariableNames() {
  const { watch } = useFormContext<MolecularDataQueryFormState>();
  return getCellVariableNames(watch('queryType'), watch('genes'), watch('proteins'), watch('cellTypes'));
}

export function useQueryType() {
  const { watch } = useFormContext<MolecularDataQueryFormState>();
  const queryType = watch('queryType');
  return queryTypes[queryType];
}

export function useIsQueryType(type: 'gene' | 'protein' | 'cell-type') {
  const { watch } = useFormContext<MolecularDataQueryFormState>();
  return watch('queryType') === type;
}

export function useMolecularDataQueryFormState() {
  return useFormContext<MolecularDataQueryFormState>();
}

export function useCrossModalityQueryParameters<T extends QueryType>(): GetDatasetsProps<T> {
  const { watch } = useFormContext<MolecularDataQueryFormState>();
  const type = watch('queryType') as T;
  const cellVariableNames = useCellVariableNames();
  const minExpression = 10 ** watch('minimumExpressionLevel');
  const minCellPercentage = watch('minimumCellPercentage');
  const modality = watch('queryMethod') === 'crossModalityATAC' ? 'atac' : 'rna';
  const parameters = {
    type,
    cellVariableNames,
    minExpression,
    minCellPercentage,
  };
  if (type === 'gene') {
    return { ...parameters, modality };
  }
  return parameters;
}
