import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import NoItemsSaved from 'js/components/savedLists/NoItemsSaved';

import { format } from 'date-fns/format';

import { SavedEntity } from 'js/components/savedLists/types';
import { InternalLink } from 'js/shared-styles/Links';
import SelectableRowCell from 'js/shared-styles/tables/SelectableRowCell';
import { StyledTableContainer, HeaderCell } from 'js/shared-styles/tables';
import { SecondaryBackgroundTooltip } from 'js/shared-styles/tooltips';
import DeleteSavedEntitiesDialog from 'js/components/savedLists/DeleteSavedEntitiesDialog';
import { SpacedSectionButtonRow, BottomAlignedTypography } from 'js/shared-styles/sections/SectionButtonRow';
import AddItemsToListDialog from 'js/components/savedLists/AddItemsToListDialog';
import { withSelectableTableProvider, useSelectableTableStore } from 'js/shared-styles/tables/SelectableTableProvider';
import SelectableHeaderCell from 'js/shared-styles/tables/SelectableHeaderCell';
import DeselectAllRowsButton from 'js/shared-styles/tables/DeselectAllRowsButton';
import NumSelectedHeader from 'js/shared-styles/tables/NumSelectedHeader';
import LoadingTableRows from 'js/shared-styles/tables/LoadingTableRows';
import useSavedEntityData from 'js/hooks/useSavedEntityData';
import { LeftMarginIconButton } from './style';

const defaultColumns = [
  { id: 'hubmap_id', label: 'HuBMAP ID' },
  { id: 'group_name', label: 'Group' },
  { id: 'entity_type', label: 'Entity Type' },
];

const source = ['hubmap_id', 'group_name', 'entity_type'];

interface SavedEntitiesTableProps {
  savedEntities: Record<string, SavedEntity>;
  deleteCallback: (args: { entityUUIDs: Set<string> }) => void;
  isSavedListPage?: boolean;
}

function SavedEntitiesTable({ savedEntities, deleteCallback, isSavedListPage = false }: SavedEntitiesTableProps) {
  const { selectedRows, deselectHeaderAndRows } = useSelectableTableStore();
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

  const columns = isSavedListPage
    ? [...defaultColumns, { id: 'dateAddedToCollection', label: 'Date Added To List' }]
    : [...defaultColumns, { id: 'dateSaved', label: 'Date Saved' }];

  function deleteSelectedSavedEntities() {
    deleteCallback({ entityUUIDs: selectedRows });
    deselectHeaderAndRows();
  }

  const { searchHits, isLoading } = useSavedEntityData(savedEntities, source);

  const selectedRowsSize = selectedRows.size;
  const savedEntitiesSize = Object.keys(savedEntities).length;

  return (
    <Stack>
      <SpacedSectionButtonRow
        leftText={
          <BottomAlignedTypography variant="subtitle1">
            {savedEntitiesSize} {savedEntitiesSize === 1 ? 'Item' : 'Items'}
          </BottomAlignedTypography>
        }
        buttons={
          selectedRowsSize === 0 ? null : (
            <div>
              <DeselectAllRowsButton />
              <SecondaryBackgroundTooltip title="Delete Items">
                <LeftMarginIconButton onClick={() => setDeleteDialogIsOpen(true)}>
                  <DeleteRoundedIcon color="primary" />
                </LeftMarginIconButton>
              </SecondaryBackgroundTooltip>
              <DeleteSavedEntitiesDialog
                dialogIsOpen={deleteDialogIsOpen}
                setDialogIsOpen={setDeleteDialogIsOpen}
                deleteSelectedSavedEntities={deleteSelectedSavedEntities}
              />
              {!isSavedListPage && (
                <AddItemsToListDialog itemsToAddUUIDS={selectedRows} onSaveCallback={deselectHeaderAndRows} />
              )}
            </div>
          )
        }
      />
      <Paper>
        <StyledTableContainer>
          <NumSelectedHeader numSelected={selectedRowsSize} />
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SelectableHeaderCell allTableRowKeys={searchHits.map((hit) => hit._id)} disabled={isLoading} />
                {columns.map((column) => (
                  <HeaderCell key={column.id}>{column.label}</HeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <LoadingTableRows numberOfRows={Object.keys(savedEntities).length} numberOfCols={5} />
              ) : (
                searchHits.map(({ _id, _source: { hubmap_id, group_name, entity_type } }) => {
                  const dateToFormat = savedEntities[_id]?.dateSaved ?? savedEntities[_id]?.dateAddedToList;
                  return (
                    _id in savedEntities && ( // on item deletion savedEntites will update before searchHits
                      <TableRow key={_id}>
                        <SelectableRowCell rowKey={_id} />
                        <TableCell>
                          <InternalLink href={`/browse/${entity_type.toLowerCase()}/${_id}`}>{hubmap_id}</InternalLink>
                        </TableCell>
                        <TableCell>{group_name}</TableCell>
                        <TableCell>{entity_type}</TableCell>
                        <TableCell>{dateToFormat && format(dateToFormat, 'yyyy-MM-dd')}</TableCell>
                      </TableRow>
                    )
                  );
                })
              )}
            </TableBody>
          </Table>
          {(Object.keys(savedEntities).length === 0 || (searchHits.length === 0 && !isLoading)) && (
            <NoItemsSaved isSavedListPage={isSavedListPage} />
          )}
        </StyledTableContainer>
      </Paper>
    </Stack>
  );
}

export default withSelectableTableProvider(SavedEntitiesTable, 'saved-entities');
