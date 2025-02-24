import React, { ComponentProps, ForwardedRef, forwardRef } from 'react';

import Slider from 'js/shared-styles/inputs/Slider';

function MarkedSlider({ marks, ...rest }: ComponentProps<typeof Slider>, ref: ForwardedRef<HTMLInputElement>) {
  return <Slider step={null} marks={marks} /* Constrains choices to the mark values. */ {...rest} ref={ref} />;
}

export default forwardRef(MarkedSlider);
