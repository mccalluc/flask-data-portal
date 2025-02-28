import React from 'react';
import { format } from 'date-fns/format';

import { InternalLink } from 'js/shared-styles/Links';
import ExpandableRow from 'js/shared-styles/tables/ExpandableRow';
import ExpandableRowCell from 'js/shared-styles/tables/ExpandableRowCell';
import { getOriginSamplesOrgan } from 'js/helpers/functions';
import { Dataset } from 'js/components/types';
import { useStore } from '../store';
import { DatasetCellsChartsProps } from '../CellsCharts/types';

interface UnitValueCellProps {
  unit: string;
  value: string;
}
function UnitValueCell({ unit, value }: UnitValueCellProps) {
  return <ExpandableRowCell>{`${value} ${unit}`}</ExpandableRowCell>;
}

function MetadataCells({ donor: { mapped_metadata } }: Pick<Dataset, 'donor'>) {
  if (mapped_metadata) {
    return (
      <>
        {(['age', 'body_mass_index'] as const).map((base) => (
          <UnitValueCell value={mapped_metadata[`${base}_value`]!} unit={mapped_metadata[`${base}_unit`]!} key={base} />
        ))}
        <ExpandableRowCell>{mapped_metadata.sex}</ExpandableRowCell>
        <ExpandableRowCell>{mapped_metadata.race?.join(', ')}</ExpandableRowCell>
      </>
    );
  }

  return (
    <>
      {['age', 'body_mass_index', 'sex', 'race'].map((field) => (
        <ExpandableRowCell key={field} />
      ))}
    </>
  );
}

interface DatasetTableRowProps {
  datasetMetadata: Dataset;
  numCells: number;
  isExpandedToStart: boolean;
  expandedContent: React.ComponentType<DatasetCellsChartsProps>;
}

function useDatasetURL(uuid: string) {
  const [queryType, cellVariableName] = useStore((state) => [state.queryType, state.cellVariableNames[0]]);
  if (queryType !== 'gene') {
    return `/browse/dataset/${uuid}`;
  }
  return `/browse/dataset/${uuid}?marker=${cellVariableName}`;
}

function DatasetTableRow({
  datasetMetadata,
  numCells,
  isExpandedToStart,
  expandedContent: ExpandedContent,
}: DatasetTableRowProps) {
  const { hubmap_id, uuid, dataset_type, donor, last_modified_timestamp } = datasetMetadata;

  const datasetUrl = useDatasetURL(uuid);

  return (
    <ExpandableRow
      numCells={numCells}
      expandedContent={<ExpandedContent {...datasetMetadata} />}
      disabledTooltipTitle="No additional results can be expanded while detailed data are being retrieved."
      isExpandedToStart={isExpandedToStart}
    >
      <ExpandableRowCell>
        <InternalLink href={datasetUrl} target="_blank">
          {hubmap_id}
        </InternalLink>
      </ExpandableRowCell>
      <ExpandableRowCell>{getOriginSamplesOrgan(datasetMetadata)}</ExpandableRowCell>
      <ExpandableRowCell>{dataset_type}</ExpandableRowCell>
      <MetadataCells donor={donor} />
      <ExpandableRowCell>{format(last_modified_timestamp, 'yyyy-MM-dd')}</ExpandableRowCell>
    </ExpandableRow>
  );
}

export default DatasetTableRow;
