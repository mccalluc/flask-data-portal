import React from 'react';

import PaddedSectionContainer from 'js/shared-styles/sections/PaddedSectionContainer';
import SectionItem from 'js/components/Detail/SectionItem';

import { StyledSectionPaper, ChartTitle } from './style';

function ProjectAttribution() {
  return (
    <PaddedSectionContainer id="attribution">
      <ChartTitle variant="h4" component="h2">
        Attribution
      </ChartTitle>
      <StyledSectionPaper>
        <SectionItem label="Creator">Roselkis Morla-Adames</SectionItem>
        <SectionItem label="PI" ml={1}>
          Nils Gehlenborg
        </SectionItem>
        <SectionItem label="Funding" ml={1}>
          NIH HuBMAP Underepresented Student Internship
        </SectionItem>
      </StyledSectionPaper>
    </PaddedSectionContainer>
  );
}

export default ProjectAttribution;
