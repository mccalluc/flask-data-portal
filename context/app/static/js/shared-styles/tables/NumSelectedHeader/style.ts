import { styled } from '@mui/material/styles';

const HeaderWrapper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.white.main,
  zIndex: theme.zIndex.fileBrowserHeader,
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
  padding: theme.spacing(0.75, 2),
  gap: theme.spacing(1),
  width: '100%',
  position: 'sticky',
  display: 'flex',
  top: 0,
}));

export { HeaderWrapper };
