import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import { Alert } from 'js/shared-styles/alerts';
import { inputPadding } from 'js/components/home-revision/FacetSearch/style';
import Typography from '@material-ui/core/Typography';

const StyledPaper = styled(Paper)`
  margin-top: ${(props) => props.theme.spacing(1)}px;
  max-height: 260px; // 250px in the mockup, but added 10px so it's clearly scrollable
  overflow-y: scroll;
  width: 100%;
`;

const StyledPopper = styled(Popper)`
  width: ${(props) => props.$searchInputWidth + inputPadding * 2}px;
`;

const StyledAlert = styled(Alert)`
  border: 0;
`;

const StyledTypography = styled(Typography)`
  padding: 6px 16px;
`;

export { StyledPaper, StyledPopper, StyledAlert, StyledTypography };
