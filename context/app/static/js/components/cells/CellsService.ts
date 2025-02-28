/* eslint-disable class-methods-use-this */
// Right now, the object doesn't have any state, but down the road,
// it might cache results, or the API calls might be made from the JS instead of Python,
// and then the instance would be initialized with the Cells API URL.

import { AutocompleteQueryResponse } from './MolecularDataQueryForm/AutocompleteEntity/types';
import { QueryType } from './queryTypes';
import { ResultCounts } from './store';

interface SearchBySubstringProps {
  targetEntity: QueryType;
  substring: string;
}
export interface GetDatasetsProps<T extends QueryType> {
  type: T;
  cellVariableNames: string[];
  minExpression: string | number;
  minCellPercentage: string | number;
  modality?: string;
}

interface GetCellPercentagesForDatasetsProps {
  uuids: string[];
  geneName: string;
  minGeneExpression: string | number;
}

interface GetCellExpressionInDatasetProps {
  uuid: string;
  cellVariableNames: string[];
}

interface GetClusterCellMatchesInDatasetProps {
  uuid: string;
  cellVariableName: string;
  minExpression: string | number;
}

export interface DatasetsSelectedByExpressionResponse {
  uuid: string;
  // TODO: Add more fields if they exist
}

export interface DatasetsSelectedByCellTypeResponse extends ResultCounts {
  list: DatasetsSelectedByExpressionResponse[];
}

export type GetDatasetsResponse<T extends QueryType> = T extends 'cell-type'
  ? DatasetsSelectedByCellTypeResponse
  : DatasetsSelectedByExpressionResponse[];

export interface CellExpressionInDataset {
  cell_id: string;
  cell_type: string;
  clusters: string[];
  dataset: string;
  modality: string;
  organ: string;
  values: Record<string, number>;
}

interface ClusterCellMatch {
  cluster_name: string;
  cluster_number: string;
  matched: number;
  modality: string;
  unmatched: number;
}

class CellsService {
  async fetchAndParse<T>(url: string): Promise<T> {
    const response = await fetch(url, { method: 'POST' });
    const responseJson = (await response.json()) as { message?: string; results?: T };
    if ('message' in responseJson) {
      throw Error(responseJson.message);
    }
    if ('results' in responseJson && responseJson.results !== undefined) {
      return responseJson.results;
    }
    throw Error('Expected "message" or "results"');
  }

  async searchBySubstring(props: SearchBySubstringProps) {
    const { targetEntity, substring } = props;
    const urlParams = new URLSearchParams();

    urlParams.append('substring', substring);

    return this.fetchAndParse<AutocompleteQueryResponse>(
      `/cells/${targetEntity}s-by-substring.json?${urlParams.toString()}`,
    );
  }

  async getDatasets<T extends QueryType>(props: GetDatasetsProps<T>): Promise<GetDatasetsResponse<T>> {
    const { type, cellVariableNames, minExpression, minCellPercentage, modality } = props;
    const urlParams = new URLSearchParams();

    if (type !== 'cell-type') {
      urlParams.append('min_expression', String(minExpression));
      urlParams.append('min_cell_percentage', String(minCellPercentage));
      if (modality) {
        urlParams.append('modality', modality);
      }
    }

    cellVariableNames.forEach((cellVariableName) => {
      urlParams.append('cell_variable_name', cellVariableName);
    });

    return this.fetchAndParse(`/cells/datasets-selected-by-${type}.json?${urlParams.toString()}`);
  }

  async getCellPercentagesForDatasets(props: GetCellPercentagesForDatasetsProps) {
    const { uuids, geneName, minGeneExpression } = props;
    const urlParams = new URLSearchParams();

    uuids.forEach((uuid) => {
      urlParams.append('uuid', uuid);
    });
    urlParams.append('gene_name', geneName);
    urlParams.append('min_gene_expression', String(minGeneExpression));

    return this.fetchAndParse(`/cells/cell-percentages-for-datasets.json?${String(urlParams)}`);
  }

  getCellExpressionInDatasetURL({ uuid, cellVariableNames }: GetCellExpressionInDatasetProps) {
    const urlParams = new URLSearchParams();

    urlParams.append('uuid', uuid);
    if (cellVariableNames.length === 0) {
      throw Error('At least one cell variable name must be provided');
    }

    if (cellVariableNames[0].startsWith('CL:')) {
      // For some reason, the cell type lookups need to be manually indexed here
      // but applying the same logic to the gene/protein lookups makes the API return no expression values
      cellVariableNames.forEach((cellVariableName, idx) => {
        urlParams.append(`cell_variable_names[${idx}]`, cellVariableName);
      });
    } else {
      cellVariableNames.forEach((name) => {
        urlParams.append(`cell_variable_names`, name);
      });
    }

    return `/cells/cell-expression-in-dataset.json?${urlParams.toString()}`;
  }

  async getCellExpressionInDataset(props: GetCellExpressionInDatasetProps) {
    return this.fetchAndParse<CellExpressionInDataset[]>(this.getCellExpressionInDatasetURL(props));
  }

  async getAllIndexedUUIDs() {
    return this.fetchAndParse<string[]>(`/cells/all-indexed-uuids.json`);
  }

  getClusterCellMatchesInDatasetURL({ uuid, cellVariableName, minExpression }: GetClusterCellMatchesInDatasetProps) {
    const urlParams = new URLSearchParams();

    urlParams.append('uuid', uuid);
    urlParams.append('cell_variable_name', cellVariableName);
    urlParams.append('min_expression', String(minExpression));

    return `/cells/cells-in-dataset-clusters.json?${urlParams.toString()}`;
  }

  async getClusterCellMatchesInDataset(props: GetClusterCellMatchesInDatasetProps) {
    return this.fetchAndParse<Record<string, ClusterCellMatch>>(this.getClusterCellMatchesInDatasetURL(props));
  }

  async getAllNamesForCellType(cellType: string) {
    return this.fetchAndParse<string[]>(`/cells/all-names-for-cell-type.json?cell_type=${cellType}`);
  }
}

export default CellsService;
