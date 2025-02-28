import React, { forwardRef, useCallback } from 'react';

import { useAccordionStepsStore } from 'js/shared-styles/accordions/AccordionSteps/store';
import IndependentStepAccordion from './IndependentStepAccordion';

interface StepAccordionProps {
  index: number;
  summaryHeading: string | React.ReactElement;
  content?: React.ReactElement;
  id: string;
}

const StepAccordion = forwardRef(function StepAccordion(
  { index, ...props }: StepAccordionProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { expandStep, openStepIndex, completedStepsText } = useAccordionStepsStore();

  const onChange = useCallback(() => {
    expandStep(index);
  }, [expandStep, index]);

  const isExpanded = openStepIndex === index;

  // The accordion should be disabled if the previous step has not been completed.
  const disabled = index > Object.keys(completedStepsText).length;

  return (
    <IndependentStepAccordion
      {...props}
      index={index}
      ref={ref}
      onChange={onChange}
      isExpanded={isExpanded}
      disabled={disabled}
    />
  );
});

export default StepAccordion;
