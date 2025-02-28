import React, { ForwardedRef, forwardRef } from 'react';
import MUISlider, { SliderProps as MUISliderProps } from '@mui/material/Slider';
import FormHelperText from '@mui/material/FormHelperText';

import { StyledFormLabel } from './style';

interface SliderProps extends MUISliderProps {
  label: string;
  id: string;
  helperText?: string;
}

function Slider(
  { min, max, value, onChange, id, label, helperText, ...rest }: SliderProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <>
      <StyledFormLabel id={id}>{label}</StyledFormLabel>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      <MUISlider
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        aria-labelledby={id}
        valueLabelDisplay="auto"
        {...rest}
        ref={ref}
      />
    </>
  );
}

export default forwardRef(Slider);
