import React, { forwardRef } from 'react';
import Accordion from '@mui/material/Accordion';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import Box from '@mui/material/Box';

import { AccordionSummaryHeading, StyledAccordionSummary } from './style';
import AccordionStepProvider from './AccordionStepContext';
import CompletedStepText from './CompletedStepText';

interface StepAccordionProps {
  index: number;
  summaryHeading: string | React.ReactElement;
  content?: React.ReactElement;
  id: string;
  onChange?: () => void;
  disabled?: boolean;
  isExpanded?: boolean;
  completedStepText?: string | React.ReactElement;
  noProvider?: boolean;
}

const IndependentStepAccordion = forwardRef(function IndependentStepAccordion(
  {
    index,
    summaryHeading,
    content,
    id,
    onChange,
    disabled,
    isExpanded = false,
    completedStepText,
    noProvider,
  }: StepAccordionProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const ContentWrapper = noProvider ? Box : AccordionStepProvider;
  return (
    <Accordion onChange={onChange} disabled={disabled} expanded={isExpanded} id={id} ref={ref}>
      <StyledAccordionSummary
        expandIcon={<ArrowDropUpRoundedIcon />}
        $isExpanded={isExpanded}
        data-testid={`accordion-summary-${index}`}
        id={`${id}-summary`}
      >
        <AccordionSummaryHeading variant="subtitle2" $isExpanded={isExpanded}>
          {summaryHeading}
        </AccordionSummaryHeading>
        <CompletedStepText completedStepText={completedStepText} isExpanded={isExpanded} index={index} />
      </StyledAccordionSummary>
      <ContentWrapper index={index}>
        <Box pt={1} px={2} pb={2}>
          {content}
        </Box>
      </ContentWrapper>
    </Accordion>
  );
});

export default IndependentStepAccordion;
