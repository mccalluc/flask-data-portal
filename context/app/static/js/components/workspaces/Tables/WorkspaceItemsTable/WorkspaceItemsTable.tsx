import React from 'react';
import { format } from 'date-fns/format';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/system/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { useEventCallback } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { Alert } from 'js/shared-styles/alerts/Alert';
import { InternalLink } from 'js/shared-styles/Links';
import { getFieldPrefix, getFieldValue, isWorkspace } from 'js/components/workspaces/utils';
import { CheckIcon, CloseFilledIcon, DownIcon, EmailIcon, EyeIcon, MoreIcon } from 'js/shared-styles/icons';
import SelectableChip from 'js/shared-styles/chips/SelectableChip';
import { LineClamp } from 'js/shared-styles/text';
import { TooltipButton, TooltipIconButton } from 'js/shared-styles/buttons/TooltipButton';
import { SecondaryBackgroundTooltip } from 'js/shared-styles/tooltips';
import { useWorkspacesList } from 'js/components/workspaces/hooks';
import WorkspaceLaunchStopButtons from 'js/components/workspaces/WorkspaceLaunchStopButtons';
import { LaunchStopButton } from 'js/components/workspaces/WorkspaceLaunchStopButtons/WorkspaceLaunchStopButtons';
import useWorkspaceItemsTable from 'js/components/workspaces/Tables/WorkspaceItemsTable/hooks';
import IconDropdownMenu from 'js/shared-styles/dropdowns/IconDropdownMenu';
import { IconDropdownMenuItem } from 'js/shared-styles/dropdowns/IconDropdownMenu/IconDropdownMenu';
import { RotatedTooltipButton } from 'js/shared-styles/buttons';
import { OrderIcon, SortDirection, getSortOrder } from 'js/shared-styles/tables/TableOrdering/TableOrdering';

import { TableField, WorkspaceItem, WorkspaceItemsTableProps } from './types';
import {
  ChipWrapper,
  CompactTableRow,
  ExpandedTableCell,
  ExpandedTableRow,
  StyledHeaderCell,
  StyledTable,
  StyledTableBody,
  StyledTableCell,
  StyledButton,
  StyledTableContainer,
  StyledTableRow,
  StyledTableHead,
  StyledCheckboxCell,
} from './style';

const options = [
  {
    children: 'Decline Invitation',
    // TODO: update once dialog is implemented
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onClick: () => {},
    icon: CloseFilledIcon,
  },
];

const acceptInviteTooltip =
  'Accept workspace copy invitation. This will create a copy of this workspace to your profile.';
const previewInviteTooltip = 'Preview the details of this workspace.';
const moreOptionsTooltip = 'View additional actions.';

function EndButtons({ item }: { item: WorkspaceItem }) {
  const { handleStopWorkspace, isStoppingWorkspace, workspacesList } = useWorkspacesList();

  // If the item is a workspace
  if (isWorkspace(item)) {
    return (
      <WorkspaceLaunchStopButtons
        workspace={item}
        button={LaunchStopButton}
        handleStopWorkspace={handleStopWorkspace}
        isStoppingWorkspace={isStoppingWorkspace}
        showLaunch
        showStop
      />
    );
  }

  const isAccepted = getFieldValue({ item, field: 'is_accepted' });
  const sharedWorkspaceId = item?.shared_workspace_id?.id;

  // If the item is an accepted invitation
  if (isAccepted && sharedWorkspaceId) {
    const workspace = workspacesList.find((w) => w.id === sharedWorkspaceId);
    if (!workspace) return null;

    return (
      <Stack alignItems="end" marginRight={2}>
        <WorkspaceLaunchStopButtons
          workspace={workspace}
          button={LaunchStopButton}
          handleStopWorkspace={handleStopWorkspace}
          isStoppingWorkspace={isStoppingWorkspace}
          showLaunch
          showStop
        />
      </Stack>
    );
  }

  // If the item is a pending invitation
  return (
    <Stack direction="row" justifyContent="end" alignItems="center">
      <IconDropdownMenu tooltip={moreOptionsTooltip} icon={MoreIcon} button={RotatedTooltipButton}>
        {options.map((props) => (
          <IconDropdownMenuItem key={props.children} {...props} />
        ))}
      </IconDropdownMenu>
      <TooltipIconButton tooltip={previewInviteTooltip}>
        <EyeIcon color="primary" fontSize="1.5rem" />
      </TooltipIconButton>
      <TooltipIconButton tooltip={acceptInviteTooltip}>
        <CheckIcon color="success" fontSize="1.5rem" />
      </TooltipIconButton>
    </Stack>
  );
}

function ItemCheckbox({
  showCheckbox,
  checked,
  onChange,
}: {
  showCheckbox: boolean;
  checked?: boolean;
  onChange: () => void;
}) {
  if (!showCheckbox) {
    return null;
  }

  return (
    <StyledCheckboxCell>
      <Checkbox checked={checked} onChange={onChange} />
    </StyledCheckboxCell>
  );
}

function SortHeaderCell({
  field,
  label,
  sortField,
  setSortField,
}: {
  field: string;
  label: string;
  sortField: { direction: SortDirection; field: string };
  setSortField: React.Dispatch<React.SetStateAction<{ direction: SortDirection; field: string }>>;
}) {
  const isCurrentSortField = field === sortField.field;

  const handleClick = useEventCallback(() => {
    const newSortDirection = getSortOrder({ direction: sortField.direction, isCurrentSortField });
    setSortField({ direction: newSortDirection, field });
  });

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
        <OrderIcon direction={sortField.direction} isCurrentSortField={isCurrentSortField} />
      </IconButton>
    </StyledHeaderCell>
  );
}

function CellContent({ item, field }: { field: string; item: WorkspaceItem }) {
  const prefix = getFieldPrefix(field);
  const fieldValue = getFieldValue({ item, field });

  switch (field) {
    case `${prefix}name`: {
      const workspaceId = getFieldValue({ item, field: 'id', prefix });
      const isAccepted = getFieldValue({ item, field: 'is_accepted' });

      return (
        <Stack direction="row" spacing={1} alignItems="center">
          {isAccepted && (
            <SecondaryBackgroundTooltip title="Accepted workspace invitation">
              <CheckIcon color="success" fontSize="0.75rem" />
            </SecondaryBackgroundTooltip>
          )}
          <InternalLink href={`/workspaces/${workspaceId}`}>
            <LineClamp lines={1}>{fieldValue}</LineClamp>
          </InternalLink>
          <Box>{`(ID: ${workspaceId})`}</Box>
        </Stack>
      );
    }
    case `${prefix}user_id.username`: {
      if ('user_id' in item && !item.user_id) {
        return <Typography>Me</Typography>;
      }

      const firstName = getFieldValue({ item, field: 'user_id.first_name', prefix });
      const lastName = getFieldValue({ item, field: 'user_id.last_name', prefix });
      const email = getFieldValue({ item, field: 'user_id.email', prefix });

      return (
        <Stack direction="row" alignItems="center">
          <Typography>{`${firstName} ${lastName}`}</Typography>
          <TooltipButton href={`mailto:${email}`} sx={{ minWidth: 0 }} tooltip={`Mail to ${email}`}>
            <EmailIcon color="info" />
          </TooltipButton>
        </Stack>
      );
    }
    case `${prefix}datetime_created`:
    case `${prefix}datetime_share_created`:
    case `${prefix}datetime_last_job_launch`: {
      const date = fieldValue ?? getFieldValue({ item, field: 'datetime_created', prefix });
      return format(date, 'yyyy-MM-dd');
    }
    default:
      return <Typography>{fieldValue}</Typography>;
  }
}

interface RowProps<T extends WorkspaceItem> {
  item: T;
  tableFields: TableField[];
  selectedItemIds?: Set<string>;
  toggleItem?: (itemId: string) => void;
}

const ResultRow = React.memo(function ResultRow<T extends WorkspaceItem>({
  item,
  tableFields,
  selectedItemIds,
  toggleItem,
}: RowProps<T>) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const prefix = getFieldPrefix(tableFields[0].field);
  const description = getFieldValue({ item, field: 'description', prefix });
  const itemId = 'id' in item ? item.id.toString() : item.original_workspace_id.id.toString();

  return (
    <>
      <CompactTableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <ItemCheckbox
          showCheckbox={!!selectedItemIds}
          checked={selectedItemIds?.has(itemId)}
          onChange={() => toggleItem?.(itemId)}
        />
        <StyledTableCell width="0">
          {description && (
            <IconButton aria-label="expand row" size="small" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
        </StyledTableCell>
        {tableFields.map(({ field }) => (
          <StyledTableCell key={field}>
            <CellContent field={field} item={item} />
          </StyledTableCell>
        ))}
        <StyledTableCell>
          <EndButtons item={item} />
        </StyledTableCell>
      </CompactTableRow>
      {description && (
        <ExpandedTableRow>
          {selectedItemIds && toggleItem && <ExpandedTableCell />}
          <ExpandedTableCell />
          <ExpandedTableCell colSpan={tableFields.length + 1}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box paddingTop={0.5} paddingBottom={1}>
                {description}
              </Box>
            </Collapse>
          </ExpandedTableCell>
        </ExpandedTableRow>
      )}
    </>
  );
});

const HeaderCells = React.memo(function HeaderCells({
  tableFields,
  sortField,
  setSortField,
}: {
  tableFields: TableField[];
  sortField: { direction: SortDirection; field: string };
  setSortField: React.Dispatch<React.SetStateAction<{ direction: SortDirection; field: string }>>;
}) {
  return (
    <>
      {tableFields.map(({ field, label }) => (
        <SortHeaderCell key={field} field={field} label={label} sortField={sortField} setSortField={setSortField} />
      ))}
    </>
  );
});

function SeeMoreRows({
  showSeeMoreOption,
  numVisibleItems,
  setNumVisibleItems,
  totalItems,
}: {
  showSeeMoreOption?: boolean;
  numVisibleItems: number;
  setNumVisibleItems: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
}) {
  if (!showSeeMoreOption || numVisibleItems >= totalItems) {
    return null;
  }

  return (
    <StyledButton variant="text" onClick={() => setNumVisibleItems((prev) => prev + 3)} fullWidth>
      <Stack direction="row" spacing={1} marginY={0.5} alignItems="center">
        <Typography variant="button">See More</Typography>
        <DownIcon />
      </Stack>
    </StyledButton>
  );
}

function LoadingRows({ tableWidth }: { tableWidth: number }) {
  return Array.from({ length: 3 }, (i, rowIndex) => (
    <TableRow key={`row-${rowIndex}`}>
      {Array.from({ length: tableWidth }, (j, cellIndex) => (
        <StyledTableCell key={`cell-${rowIndex}-${cellIndex}`}>
          <Skeleton variant="text" />
        </StyledTableCell>
      ))}
    </TableRow>
  ));
}

function TableResults<T extends WorkspaceItem>({
  isLoading,
  sortedItems,
  tableFields,
  numVisibleItems,
  selectedItemIds,
  toggleItem,
}: {
  sortedItems: T[];
  numVisibleItems: number;
} & Pick<WorkspaceItemsTableProps<T>, 'isLoading' | 'tableFields' | 'selectedItemIds' | 'toggleItem'>) {
  if (isLoading) {
    return <LoadingRows tableWidth={tableFields.length} />;
  }

  return sortedItems
    .slice(0, numVisibleItems)
    .map((item) => (
      <ResultRow
        key={'id' in item ? item.id : item.original_workspace_id.id}
        item={item}
        tableFields={tableFields}
        selectedItemIds={selectedItemIds}
        toggleItem={toggleItem}
      />
    ));
}

function TableContent<T extends WorkspaceItem>(props: WorkspaceItemsTableProps<T>) {
  const { items, isLoading, itemType, tableFields, toggleItem, selectedItemIds, showSeeMoreOption } = props;

  const {
    noFiltersSelected,
    sortedItems,
    sortField,
    setSortField,
    numVisibleItems,
    setNumVisibleItems,
    onToggleCheckboxHeader,
  } = useWorkspaceItemsTable<T>(props);

  if (!isLoading && noFiltersSelected) {
    return <Alert severity="info">{`No ${itemType}s to display based on current filters.`}</Alert>;
  }

  return (
    <>
      <StyledTableContainer>
        <StyledTable>
          <StyledTableHead>
            <StyledTableRow>
              <ItemCheckbox
                showCheckbox={!!selectedItemIds}
                checked={selectedItemIds?.size === items.length}
                onChange={onToggleCheckboxHeader}
              />
              <StyledTableCell width="0" />
              <HeaderCells tableFields={tableFields} sortField={sortField} setSortField={setSortField} />
              <StyledTableCell />
            </StyledTableRow>
          </StyledTableHead>
          <StyledTableBody>
            <TableResults
              isLoading={isLoading}
              sortedItems={sortedItems}
              tableFields={tableFields}
              numVisibleItems={numVisibleItems}
              selectedItemIds={selectedItemIds}
              toggleItem={toggleItem}
            />
          </StyledTableBody>
        </StyledTable>
      </StyledTableContainer>
      <SeeMoreRows
        showSeeMoreOption={showSeeMoreOption}
        numVisibleItems={numVisibleItems}
        setNumVisibleItems={setNumVisibleItems}
        totalItems={items.length}
      />
    </>
  );
}

function WorkspaceItemsTable<T extends WorkspaceItem>(props: WorkspaceItemsTableProps<T>) {
  const { filters, ...rest } = props;

  return (
    <Box>
      <ChipWrapper>
        {filters.map(({ label, show, setShow, disabled }) => (
          <SelectableChip
            key={label}
            label={label}
            isSelected={show}
            onClick={() => setShow((prev) => !prev)}
            disabled={disabled}
          />
        ))}
      </ChipWrapper>
      <TableContent filters={filters} {...rest} />
    </Box>
  );
}

export default WorkspaceItemsTable;
