import { AutocompleteResult } from './AutocompleteEntity/types';

export const QUERY_TYPES = ['gene', 'protein', 'cell-type'] as const;
export type QueryType = (typeof QUERY_TYPES)[number];

export const GENE_QUERY_METHODS = {
  scFind: 'scFind - RNAseq experiments (gene expression)',
  crossModalityRNA: 'Cells Cross-Modality - RNAseq experiments (gene expression)',
  crossModalityATAC: 'Cells Cross-Modality - ATACseq experiments (DNA accessibility)',
};

export type GeneQueryMethod = keyof typeof GENE_QUERY_METHODS;

export interface SCFindGeneQueryFormState {
  queryType: 'gene';
  queryMethod: 'scFind';
  genes: AutocompleteResult[];
  threshold: number;
}

export interface SCFindCellTypeQueryFormState {
  cellTypes: AutocompleteResult[];
}

export interface CrossModalityGeneQueryFormState {
  queryType: 'gene';
  queryMethod: 'crossModalityRNA' | 'crossModalityATAC';
  minimumExpressionLevel: number;
  minimumCellPercentage: number;
  genes: AutocompleteResult[];
}

export interface CrossModalityProteinQueryFormState {
  queryType: 'protein';
  proteins: AutocompleteResult[];
  minimumAbundance: number;
  minimumCellPercentage: number;
}

export interface CellTypeQueryFormState {
  queryType: 'cell-type';
  queryMethod: 'scFind' | 'crossModality';
  cellTypes: AutocompleteResult[];
}

export type MolecularDataQueryFormState = {
  queryType: QueryType;
  geneQueryMethod: GeneQueryMethod;
} & (
  | SCFindGeneQueryFormState
  | SCFindCellTypeQueryFormState
  | CrossModalityGeneQueryFormState
  | CrossModalityProteinQueryFormState
  | CellTypeQueryFormState
);
