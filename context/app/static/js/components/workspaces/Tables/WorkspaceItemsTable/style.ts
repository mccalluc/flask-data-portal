import { Theme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';

import { HeaderCell } from 'js/shared-styles/tables';
import NumSelectedHeader from 'js/shared-styles/tables/NumSelectedHeader';

const border = (theme: Theme) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
});

const ChipWrapper = styled('div')(({ theme }) => ({
  position: 'sticky',
  display: 'flex',
  top: 0,
  padding: theme.spacing(1.5, 2),
  gap: theme.spacing(1),
  zIndex: theme.zIndex.fileBrowserHeader,
  backgroundColor: theme.palette.white.main,
  borderTop: 'none',
  ...border(theme),
}));

const StyledTable = styled(Table)(({ theme }) => ({
  backgroundColor: theme.palette.white.main,
  boxShadow: theme.shadows[1],
  tableLayout: 'auto',
}));

const StyledTableBody = styled(TableBody)({
  width: '100%',
  maxHeight: '400px',
  overflowY: 'auto',
  border: 'none',
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.white.main,
  borderBottom: 'none',
  ...border(theme),
}));

const CompactTableRow = styled(StyledTableRow)(({ theme }) => ({
  td: {
    padding: theme.spacing(1),
  },
  borderBottom: 'none',
}));

const ExpandedTableRow = styled(StyledTableRow)({
  paddingBottom: 0,
  paddingTop: 0,
  borderTop: 'none',
});

const StyledTableCell = styled(TableCell)({
  border: 'none',
  em: {
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
});

const ExpandedTableCell = styled(StyledTableCell)(({ theme }) => ({
  paddingBottom: 0,
  paddingTop: 0,
  paddingLeft: theme.spacing(1),
}));

const StyledHeaderCell = styled(HeaderCell)({
  whiteSpace: 'nowrap',
});

const StyledCheckboxCell = styled(StyledTableCell)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: theme.spacing(1.25),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primaryContainer.contrastText,
  backgroundColor: theme.palette.primaryContainer.main,
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '425px',
  width: '100%',
  borderTop: 'none',
  borderLeft: 'none',
  overflowY: 'auto',
  overflowX: 'hidden',
  ...border(theme),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.fileBrowserHeader,
  background: theme.palette.white.main,
}));

const StyledNumSelectedHeader = styled(NumSelectedHeader)(({ theme }) => ({
  ...border(theme),
}));

export {
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
  StyledNumSelectedHeader,
};
