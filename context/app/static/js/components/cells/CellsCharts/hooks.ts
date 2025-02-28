import CellsService, { CellExpressionInDataset } from 'js/components/cells/CellsService';
import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useExpandableRowStore } from 'js/shared-styles/tables/ExpandableRow/store';
import { extractCLID } from '../CrossModalityResults/utils';

interface CellsChartsDataProps {
  uuid: string;
  cellVariableName: string;
  minExpression: number;
}

async function fetchCellsChartsData({ uuid, cellVariableName, minExpression }: CellsChartsDataProps) {
  const cs = new CellsService();

  const t0 = performance.now();
  const [expressionData, clusterData] = await Promise.all([
    cs.getCellExpressionInDataset({
      uuid,
      cellVariableNames: [cellVariableName],
    }),
    cs.getClusterCellMatchesInDataset({
      uuid,
      cellVariableName,
      minExpression,
    }),
  ]);
  const t1 = performance.now();
  const timeWaiting = (t1 - t0) / 1000;
  const numCells = expressionData.length;
  const diagnosticInfo = { numCells, timeWaiting };

  return { expressionData, clusterData, diagnosticInfo };
}

interface DiagnosticInfo {
  numCells: number;
  timeWaiting: number;
}

function useCellsChartsData({ uuid, cellVariableName, minExpression }: CellsChartsDataProps) {
  const { isExpanded } = useExpandableRowStore();

  const { data, isLoading } = useSWR(
    () => (isExpanded ? { uuid, cellVariableName, minExpression } : null),
    fetchCellsChartsData,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  const cellsData = data ? { expressionData: data.expressionData, clusterData: data.clusterData } : {};
  const diagnosticInfo: DiagnosticInfo | undefined = data ? data.diagnosticInfo : undefined;

  return { isLoading, diagnosticInfo, cellsData };
}

type UseCellTypesChartsDataProps = Pick<CellsChartsDataProps, 'uuid'> & {
  cellVariableNames: string[];
};

function useCellTypesChartsData({ uuid, cellVariableNames: cellNames }: UseCellTypesChartsDataProps) {
  const cellVariableNames = cellNames.map(extractCLID).filter((clid) => clid) as string[];
  const { isExpanded } = useExpandableRowStore();
  const { data, ...rest } = useSWR<{ results: CellExpressionInDataset[] }, string | null>(
    () =>
      isExpanded && cellVariableNames.length > 0
        ? new CellsService().getCellExpressionInDatasetURL({ uuid, cellVariableNames })
        : null,
    (url: string) => fetcher({ url, requestInit: { method: 'POST' } }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  return { expressionData: data, ...rest };
}

export { useCellsChartsData, useCellTypesChartsData };
