import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Description from 'js/shared-styles/sections/Description';

import { WhiteBackgroundIconButton } from 'js/shared-styles/buttons';
import TextField from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Button from '@mui/material/Button';

const StyledButton = styled(WhiteBackgroundIconButton)(({ theme }) => ({
  height: theme.spacing(4.5),
}));

const LinkButton = styled('button')({
  all: 'unset',
  cursor: 'pointer',
});

const Bold = styled(Typography)({
  fontWeight: 'bold',
});

const StyledDescription = styled(Description)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2.5),
}));

const StyledSubtitle1 = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.palette.text.primary,
}));

const StyledSubtitle2 = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.primary,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1, 0),
  },
}));

const StyledSearchIcon = styled(SearchRoundedIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(1),
}));

const StyledLaunchButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(1, 3),
}));

export {
  StyledButton,
  LinkButton,
  Bold,
  StyledDescription,
  StyledSubtitle1,
  StyledSubtitle2,
  StyledTextField,
  StyledSearchIcon,
  StyledLaunchButton,
};
