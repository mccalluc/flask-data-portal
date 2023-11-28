import { fetcher } from 'js/helpers/swr';
import useSWR from 'swr';
import { useCellTypesContext } from './CellTypesContext';

export const useCellTypeDatasets = () => {
  const { cellId } = useCellTypesContext();
  const swr = useSWR<string[]>(`/cell-types/${cellId}/datasets.json`, (url: string) => fetcher({ url }));
  return swr;
};

interface CellTypeSample {
  hubmap_id: string;
  last_modified_timestamp: number;
  organ: string[];
  sample_category: string;
  uuid: string;
}

type CellTypeSamples = CellTypeSample[];

export const useCellTypeSamples = () => {
  const { cellId } = useCellTypesContext();
  const swr = useSWR<CellTypeSamples>(`/cell-types/${cellId}/samples.json`, (url: string) => fetcher({ url }));
  return swr;
};

export interface CellTypeOrgan {
  celltype_cells: number;
  organ: string;
  total_cells: number;
  other_cells: number;
}

type CellTypeOrgans = CellTypeOrgan[];

const mockData = [
  { celltype_cells: 179, organ: 'Heart', other_cells: 72932, total_cells: 73111 },
  { celltype_cells: 507, organ: 'Kidney', other_cells: 1368507, total_cells: 1369014 },
];

export const useCellTypeOrgans = () => {
  const { cellId } = useCellTypesContext();
  const swr = useSWR<CellTypeOrgans>(`/cell-types/${cellId}/organs.json`, (url: string) => fetcher({ url }));
  // return swr;
  return { ...swr, data: mockData };
};
