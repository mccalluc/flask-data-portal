import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import LinearProgress from '@material-ui/core/LinearProgress';

const ModalContentWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const StyledIconButton = styled(IconButton)`
  // mui uses padding for icon button sizes which causes buttons with different size icons to vary in size
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  position: absolute;
  top: -14px;
  right: -14px;
`;

const StyledCloseIcon = styled(CancelRoundedIcon)`
  background-color: #fff;
  border-radius: 100%;
`;

const ButtonWrapper = styled.div`
  min-width: 125px;
`;

const Flex = styled.div`
  display: flex;
`;

const ErrorIcon = styled(ErrorRoundedIcon)`
  color: ${(props) => props.theme.palette.error.main};
  font-size: 1.25rem;
  margin-right: ${(props) => props.theme.spacing(0.5)}px;
`;

const StyledLinearProgress = styled(LinearProgress)`
  max-width: 96px; //match max size of View PDF button
`;

export { ModalContentWrapper, StyledIconButton, StyledCloseIcon, ButtonWrapper, Flex, ErrorIcon, StyledLinearProgress };
