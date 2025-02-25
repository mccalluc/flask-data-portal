import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

type SelectableChipProps = Pick<ChipProps<'button'>, 'label' | 'onClick' | 'disabled' | 'sx'> & {
  isSelected: boolean;
};

function SelectableChip({ label, onClick, disabled, isSelected, sx, ...rest }: SelectableChipProps) {
  return (
    <Chip
      label={label}
      clickable
      onClick={onClick}
      component="button"
      disabled={disabled}
      color={isSelected ? 'primary' : undefined}
      icon={isSelected ? <CheckRoundedIcon fontSize="small" /> : undefined}
      variant={isSelected ? 'filled' : 'outlined'}
      sx={{
        ...sx,
        px: isSelected ? 0 : 1.5,
        borderRadius: 4,
      }}
      {...rest}
    />
  );
}

export default SelectableChip;
