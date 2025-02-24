export type QueryType = 'gene' | 'protein' | 'cell-type';
export interface QueryTypeObj {
  value: QueryType;
  measurement: string;
  label: string;
  fieldName: 'minimumExpressionLevel' | 'minimumAbundance' | null;
  entityFieldName: 'genes' | 'proteins' | 'cellTypes';
}

const queryTypes: Record<QueryType, QueryTypeObj> = {
  gene: {
    value: 'gene',
    measurement: 'Expression Level',
    label: 'Gene',
    fieldName: 'minimumExpressionLevel',
    entityFieldName: 'genes',
  },
  protein: {
    value: 'protein',
    measurement: 'Abundance',
    label: 'Protein',
    fieldName: 'minimumAbundance',
    entityFieldName: 'proteins',
  },
  'cell-type': {
    value: 'cell-type',
    measurement: 'Cell Count',
    label: 'Cell Type',
    fieldName: null,
    entityFieldName: 'cellTypes',
  },
};

const isQueryType = (value: string): value is QueryType => {
  return Object.keys(queryTypes).includes(value);
};

export { queryTypes, isQueryType };
