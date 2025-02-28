import React from 'react';
import Stack from '@mui/material/Stack';

import { AccordionText, SuccessIcon } from './style';

interface CompletedStepTextProps {
  completedStepText?: React.ReactNode;
  isExpanded: boolean;
  index: number;
}

export default function CompletedStepText({ completedStepText, isExpanded, index }: CompletedStepTextProps) {
  if (!completedStepText) {
    return null;
  }
  return (
    <Stack flexBasis="80%" direction="row" justifyContent="space-between">
      <AccordionText variant="body2" $isExpanded={isExpanded}>
        {completedStepText}
      </AccordionText>
      <SuccessIcon data-testid={`accordion-success-icon-${index}`} />
    </Stack>
  );
}
