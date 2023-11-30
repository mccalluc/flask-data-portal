import { Theme, styled, CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box, { BoxProps } from '@mui/material/Box';

import { InternalLink } from 'js/shared-styles/Links';

const panelBorderStyles = (theme: Theme) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
});

const overflowCss: CSSObject = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
};

interface PanelBoxProps extends BoxProps {
  noPadding?: boolean;
}

const PanelBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'noPadding',
})<PanelBoxProps>(({ theme, noPadding }) => ({
  ...panelBorderStyles(theme),
  padding: noPadding ? 0 : theme.spacing(2, 3),
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    backgroundColor: theme.palette.common.hoverShadow,
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

const LeftTextWrapper = styled(Box)(({ theme }) => ({
  whitespace: 'nowrap',
  minWidth: 0, // needed to handle overflow
  marginRight: theme.spacing(1),
}));

const TruncatedText = styled(Typography)(overflowCss);

const TruncatedLink = styled(InternalLink)({
  ...overflowCss,
  display: 'block', // text-overflow only applies to block elements
});

const RightTextWrapper = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  paddingLeft: theme.spacing(0.5),
  fontSize: theme.typography.body2.fontSize,
}));

export { PanelBox, LeftTextWrapper, TruncatedText, TruncatedLink, RightTextWrapper, panelBorderStyles };
