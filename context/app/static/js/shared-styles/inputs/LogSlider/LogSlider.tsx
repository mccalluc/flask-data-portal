import React, { ComponentProps, ForwardedRef, forwardRef, useMemo } from 'react';

import MarkedSlider from 'js/shared-styles/inputs/Slider';

function powerOf10(value: number) {
  return (
    <>
      10<sup>{value}</sup>
    </>
  );
}

interface LogSliderProps extends Omit<ComponentProps<typeof MarkedSlider>, 'min' | 'max'> {
  minLog: number;
  maxLog: number;
}

function LogSlider({ minLog, maxLog, ...rest }: LogSliderProps, ref: ForwardedRef<HTMLInputElement>) {
  const marks = useMemo(() => {
    return [...Array(1 + maxLog - minLog).keys()].map((k) => k + minLog);
  }, [minLog, maxLog]);
  return (
    <MarkedSlider
      min={minLog}
      max={maxLog}
      valueLabelFormat={powerOf10}
      marks={marks.map((m) => ({
        value: m,
        label: powerOf10(m),
      }))}
      {...rest}
      ref={ref}
    />
  );
}

export default forwardRef(LogSlider);
