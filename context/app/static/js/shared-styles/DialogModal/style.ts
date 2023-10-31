import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: 0,
})) as typeof DialogTitle;

const StyledDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  height: '1.5px',
  mt: theme.spacing(1),
})) as typeof Divider;

export { StyledDivider, StyledDialogTitle };
