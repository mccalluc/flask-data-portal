import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

const StyledSwitchGrid = styled(Grid)`
  flex-wrap: nowrap;
  justify-content: center;
`;
const StyledSwitchGridItem = styled(Grid)`
  label {
    display: inline-block;
  }
`;

export { StyledSwitchGrid, StyledSwitchGridItem };
