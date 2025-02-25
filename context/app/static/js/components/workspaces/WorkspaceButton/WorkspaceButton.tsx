import { styled } from '@mui/material/styles';
import { TooltipIconButton } from 'js/shared-styles/buttons/TooltipButton';

const WorkspaceButton = styled(TooltipIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.white.main,
  color: theme.palette.primary.main,
  borderRadius: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
}));

WorkspaceButton.defaultProps = {
  size: 'small',
};

export default WorkspaceButton;
