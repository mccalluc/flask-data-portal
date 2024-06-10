import React from 'react';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DOMPurify from 'isomorphic-dompurify';
import parse from 'html-react-parser';

import { InternalLink } from 'js/shared-styles/Links';
import { getByPath } from './utils';
import {
  StyledTable,
  StyledTableBody,
  StyledTableRow,
  StyledTableCell,
  ArrowUpOn,
  ArrowDownOn,
  ArrowDownOff,
  StyledHeaderCell,
} from './style';
import { useSearch } from '../Search';
import { useSearchStore } from '../store';
import { HitDoc } from '../types';

type SortDirection = 'asc' | 'desc';

export function OrderIcon({
  direction,
  isCurrentSortField,
}: {
  direction: SortDirection;
  isCurrentSortField: boolean;
}) {
  if (!isCurrentSortField) return <ArrowDownOff />;
  if (direction === 'asc') return <ArrowUpOn />;
  if (direction === 'desc') return <ArrowDownOn />;
}

export function getSortOrder({
  direction,
  isCurrentSortField,
}: {
  direction: SortDirection;
  isCurrentSortField: boolean;
}) {
  if (!isCurrentSortField) {
    return 'desc';
  }

  return direction === 'desc' ? 'asc' : 'desc';
}

function SortHeaderCell({ field, label }: { field: string; label: string }) {
  const { sortField, setSortField } = useSearchStore();

  const { direction, field: currentSortField } = sortField;

  const isCurrentSortField = field === currentSortField;

  return (
    <StyledHeaderCell>
      {label}
      <IconButton onClick={() => setSortField({ direction: getSortOrder({ direction, isCurrentSortField }), field })}>
        <OrderIcon direction={direction} isCurrentSortField={isCurrentSortField} />
      </IconButton>
    </StyledHeaderCell>
  );
}

function ResultCell({ hit, field }: { field: string; hit: SearchHit<HitDoc> }) {
  const source = hit?._source;

  if (!source) {
    return <StyledTableCell />;
  }

  const fieldValue = getByPath(source, field);

  return (
    <StyledTableCell key={field}>
      {field === 'hubmap_id' ? <InternalLink href={`/browse/${fieldValue}`}>{fieldValue}</InternalLink> : fieldValue}
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

function ResultsTable() {
  const { searchHits: hits, loadMore, totalHitsCount } = useSearch();
  const { sourceFields } = useSearchStore();

  // TODO: Loading State
  if (!hits) {
    return null;
  }

  return (
    <Box>
      <StyledTable data-testid="search-results-table">
        <TableHead>
          <TableRow>
            {Object.entries(sourceFields).map(([field, { label }]) => (
              <SortHeaderCell key={field} field={field} label={label} />
            ))}
          </TableRow>
        </TableHead>
        <StyledTableBody>
          {hits.map((hit) => (
            <React.Fragment key={hit._id}>
              <StyledTableRow $beforeHighlight={Boolean(hit?.highlight)}>
                {Object.keys(sourceFields).map((field) => (
                  <ResultCell hit={hit} field={field} key={field} />
                ))}
              </StyledTableRow>
              {hit?.highlight && <HighlightRow colSpan={Object.keys(sourceFields).length} highlight={hit.highlight} />}
            </React.Fragment>
          ))}
        </StyledTableBody>
      </StyledTable>
      <Button variant="contained" color="primary" onClick={loadMore} fullWidth>
        See More Search Results
      </Button>
      <Box mt={2}>
        <Typography variant="caption" color="secondary" textAlign="right" component="p">
          {hits.length} Results Shown | {totalHitsCount} Total Results
        </Typography>
      </Box>
    </Box>
  );
}

export default ResultsTable;
