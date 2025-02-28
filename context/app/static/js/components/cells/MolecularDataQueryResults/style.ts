import { styled } from '@mui/material/styles';
import { Alert } from 'js/shared-styles/alerts';

const initialHeight = 300;

const CenteredFlex = styled('div')({
  width: '100%',
  minHeight: initialHeight,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
});

const FullWidthAlert = styled(Alert)({
  width: '100%',
});

export { CenteredFlex, FullWidthAlert, initialHeight };
