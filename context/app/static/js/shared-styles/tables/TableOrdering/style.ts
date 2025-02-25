import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { styled } from '@mui/material/styles';

const sharedArrowStyles = {
  verticalAlign: 'text-top',
  fontSize: '1rem',
} as const;

const ArrowUpOn = styled(ArrowUpward)(sharedArrowStyles);

const ArrowDownOn = styled(ArrowDownward)(sharedArrowStyles);

const ArrowDownOff = styled(ArrowDownward)({
  ...sharedArrowStyles,
  opacity: '40%',
});

export { ArrowUpOn, ArrowDownOn, ArrowDownOff };
