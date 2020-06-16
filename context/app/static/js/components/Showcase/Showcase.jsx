/* eslint-disable camelcase */
import React from 'react';
import Typography from '@material-ui/core/Typography';

import Visualization from '../Detail/Visualization';
import SectionHeader from '../Detail/SectionHeader';
import SectionItem from '../Detail/SectionItem';
import SectionContainer from '../Detail/SectionContainer';
import { FlexRow, FlexColumn } from '../Detail/DetailLayout/style';
import { StyledPaper } from '../Detail/Summary/style';
import { FlexColumnRight, StyledTypography, StyledDivider } from './style';

function ShowcaseLayout(props) {
  const { children } = props;
  return (
    <FlexRow>
      <FlexColumn maxWidth="lg">{children}</FlexColumn>
    </FlexRow>
  );
}

function Showcase(props) {
  const { vitData, title, assayMetadata } = props;

  const { group_name, created_by_user_displayname, created_by_user_email, description_html } = assayMetadata;

  return (
    <ShowcaseLayout>
      <SectionContainer id="summary">
        <Typography variant="h4" component="h1" color="primary">
          Showcase
        </Typography>
        <SectionHeader variant="h1" component="h2">
          {title}
        </SectionHeader>

        <StyledPaper>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: description_html }} />
          <StyledDivider orientation="vertical" flexItem />
          <FlexColumnRight>
            <StyledTypography variant="subtitle1" mb={1}>
              Creator
            </StyledTypography>
            <SectionItem label="Center">{group_name}</SectionItem>
            <SectionItem label="Email">{created_by_user_email}</SectionItem>
            <SectionItem label="Name">{created_by_user_displayname}</SectionItem>
          </FlexColumnRight>
        </StyledPaper>
      </SectionContainer>
      <Visualization vitData={vitData} />
    </ShowcaseLayout>
  );
}

export default Showcase;
