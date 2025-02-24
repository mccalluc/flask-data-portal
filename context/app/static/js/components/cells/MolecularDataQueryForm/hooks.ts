import { queryTypes } from 'js/components/cells/queryTypes';
import { useFormContext } from 'react-hook-form';
import { MolecularDataQueryFormState } from './types';

export function useCellVariableNames() {
  const { watch } = useFormContext<MolecularDataQueryFormState>();
  const queryType = watch('queryType');
  const genes = watch('genes');
  const proteins = watch('proteins');
  const cellTypes = watch('cellTypes');
  switch (queryType) {
    case 'gene':
      return genes;
    case 'protein':
      return proteins;
    case 'cell-type':
      return cellTypes;
    default:
      return [];
  }
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
