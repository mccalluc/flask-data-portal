import React, { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';
import { format } from 'date-fns/format';

import { InternalLink } from 'js/shared-styles/Links';
import { Entity } from 'js/components/types';
import SelectableHeaderCell from 'js/shared-styles/tables/SelectableHeaderCell';
import SelectableRowCell from 'js/shared-styles/tables/SelectableRowCell';
import { trackEvent } from 'js/helpers/trackers';
import DonorAgeTooltip from 'js/shared-styles/tooltips/DonorAgeTooltip';
import { useSelectableTableStore } from 'js/shared-styles/tables/SelectableTableProvider';
import NumSelectedHeader from 'js/shared-styles/tables/NumSelectedHeader';
import { OrderIcon, getSortOrder } from 'js/shared-styles/tables/TableOrdering';
import { useAllSearchIDs } from 'js/hooks/useSearchData';
import { getByPath } from './utils';
import { StyledTable, StyledTableBody, StyledTableRow, StyledTableCell, StyledHeaderCell } from './style';
import { useSearch } from '../Search';
import { useSearchStore } from '../store';
import { useGetFieldLabel } from '../fieldConfigurations';
import ViewMoreResults from './ViewMoreResults';
import { buildQuery } from '../utils';
import useESmapping from '../useEsMapping';

function SortHeaderCell({ field, label }: { field: string; label: string }) {
  const { sortField, setSortField, analyticsCategory } = useSearchStore(
    useShallow((state) => ({
      sortField: state.sortField,
      setSortField: state.setSortField,
      analyticsCategory: state.analyticsCategory,
    })),
  );

  const { direction, field: currentSortField } = sortField;

  const isCurrentSortField = field === currentSortField;

  const handleClick = useCallback(() => {
    const newSortDirection = getSortOrder({ direction, isCurrentSortField });
    setSortField({ direction: newSortDirection, field });
    trackEvent({
      category: analyticsCategory,
      action: `Sort Table View`,
      label: `${label} ${newSortDirection}}`,
    });
  }, [analyticsCategory, direction, field, isCurrentSortField, label, setSortField]);

  return (
    <StyledHeaderCell>
      {label}
      <IconButton
        aria-label="Sort Column"
        onClick={handleClick}
        sx={(theme) => ({
          color: theme.palette.text.primary,
        })}
      >
        <OrderIcon direction={direction} isCurrentSortField={isCurrentSortField} />
      </IconButton>
    </StyledHeaderCell>
  );
}

function CellContent({ field, fieldValue }: { field: string; fieldValue: string }) {
  switch (field.split('.').pop()) {
    case 'hubmap_id':
      return (
        <InternalLink href={`/browse/${fieldValue}`} data-testid="hubmap-id-link">
          {fieldValue}
        </InternalLink>
      );
    case 'last_modified_timestamp':
    case 'published_timestamp':
    case 'created_timestamp':
      // Handle datasets without published timestamps.
      if (!fieldValue) {
        return null;
      }
      return format(fieldValue, 'yyyy-MM-dd');
    case 'age':
      return <DonorAgeTooltip donorAge={fieldValue}>{fieldValue}</DonorAgeTooltip>;
    default:
      return fieldValue;
  }
}

function ResultCell({ hit, field }: { field: string; hit: SearchHit<Partial<Entity>> }) {
  const source = hit?._source;

  if (!source) {
    return <StyledTableCell />;
  }

  const fieldValue = getByPath(source, field);

  return (
    <StyledTableCell key={field}>
      <CellContent field={field} fieldValue={fieldValue} />
    </StyledTableCell>
  );
}

function HighlightRow({ colSpan, highlight }: { colSpan: number } & Required<Pick<SearchHit, 'highlight'>>) {
  const sanitizedHighlight = DOMPurify.sanitize(Object.values(highlight).join(' ... '));
  return (
    <StyledTableRow $highlight>
      <StyledTableCell colSpan={colSpan}>{parse(sanitizedHighlight)}</StyledTableCell>
    </StyledTableRow>
  );
}

function LoadingRows() {
  const { sourceFields, size } = useSearchStore(
    useShallow((state) => ({
      sourceFields: state.sourceFields,
      size: state.size,
    })),
  );

  const { table: tableFields } = sourceFields;

  return Array.from({ length: size }).map((_, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <TableRow key={i}>
      <SelectableRowCell rowKey="" disabled cellComponent={StyledTableCell} />
      {tableFields.map((field) => (
        <StyledTableCell key={field}>
          <Skeleton variant="text" />
        </StyledTableCell>
      ))}
    </TableRow>
  ));
}

interface RowProps {
  hit: SearchHit<Partial<Entity>>;
  tableFields: string[];
}

function compareRowProps(oldProps: RowProps, newProps: RowProps) {
  return oldProps.hit._id === newProps.hit._id;
}

const ResultRow = React.memo(function ResultRow({ hit, tableFields }: RowProps) {
  return (
    <>
      <StyledTableRow $beforeHighlight={Boolean(hit?.highlight)}>
        <SelectableRowCell rowKey={hit._id} />
        {tableFields.map((field) => (
          <ResultCell hit={hit} field={field} key={field} />
        ))}
      </StyledTableRow>
      {hit?.highlight && <HighlightRow colSpan={tableFields.length + 1} highlight={hit.highlight} />}
    </>
  );
}, compareRowProps);

const HeaderCells = React.memo(function HeaderCells({ tableFields }: { tableFields: string[] }) {
  const getFieldLabel = useGetFieldLabel();
  return (
    <>
      {tableFields.map((field) => (
        <SortHeaderCell key={field} field={field} label={getFieldLabel(field)} />
      ))}
    </>
  );
});

function SelectableHeaderCells() {
  const filters = useSearchStore((state) => state.filters);
  const facets = useSearchStore((state) => state.facets);
  const search = useSearchStore((state) => state.search);
  const size = useSearchStore((state) => state.size);
  const searchFields = useSearchStore((state) => state.searchFields);
  const sourceFields = useSearchStore((state) => state.sourceFields);
  const sortField = useSearchStore((state) => state.sortField);
  const defaultQuery = useSearchStore((state) => state.defaultQuery);
  const type = useSearchStore((state) => state.type);

  const mappings = useESmapping();

  const query = buildQuery({
    filters,
    facets,
    search,
    size,
    searchFields,
    sourceFields,
    sortField,
    defaultQuery,
    mappings,
    buildAggregations: false,
  });

  const { allSearchIDs, isLoading } = useAllSearchIDs(query);

  return (
    <SelectableHeaderCell
      allTableRowKeys={allSearchIDs}
      disabled={isLoading}
      selectTooltip={`Select all ${type.toLowerCase()}s in results.`}
      deselectTooltip="Reset all selections."
    />
  );
}

const Table = React.memo(function Table({
  isLoading,
  hits,
}: {
  isLoading: boolean;
  hits: never[] | SearchHit<Partial<Entity>>[];
}) {
  const tableFields = useSearchStore((state) => state.sourceFields?.table);
  const { selectedRows } = useSelectableTableStore();

  return (
    <Box>
      <NumSelectedHeader numSelected={selectedRows.size} />
      <StyledTable data-testid="search-results-table">
        <TableHead>
          <TableRow>
            <SelectableHeaderCells />
            <HeaderCells tableFields={tableFields} />
          </TableRow>
        </TableHead>
        <StyledTableBody>
          {isLoading && !hits?.length && <LoadingRows />}
          {hits.map((hit) => (
            <ResultRow hit={hit} key={hit._id} tableFields={tableFields} />
          ))}
        </StyledTableBody>
      </StyledTable>
      <ViewMoreResults />
    </Box>
  );
});

function ResultsTable({ isLoading }: { isLoading: boolean }) {
  const { searchHits: hits } = useSearch();

  return <Table hits={hits} isLoading={isLoading} />;
}

export default ResultsTable;
