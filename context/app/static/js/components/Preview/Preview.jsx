import React from 'react';
import Typography from '@material-ui/core/Typography';

import Markdown from 'js/components/Markdown';
import VisualizationWrapper from '../Detail/VisualizationWrapper';
import SectionHeader from '../Detail/SectionHeader';
import SectionContainer from '../Detail/SectionContainer';
import Attribution from '../Detail/Attribution';
import Description from '../Detail/Description';

function Preview(props) {
  const { vitData, title, assayMetadata, markdown } = props;

  const { group_name, created_by_user_displayname, created_by_user_email } = assayMetadata;

  return (
    <>
      <SectionContainer id="summary">
        <Typography variant="subtitle1">Preview</Typography>
        <SectionHeader variant="h1" component="h1">
          {title}
        </SectionHeader>
        <Description>
          HuBMAP Data Portal Previews demonstrate functionality and resources that will become available in future
          releases. Previews may rely on externally hosted data or analysis results that were generated with processing
          pipelines that are not yet integrated into the HuBMAP Data Portal infrastructure.
        </Description>
        <Markdown markdown={markdown} />
      </SectionContainer>
      <Attribution
        group_name={group_name}
        created_by_user_displayname={created_by_user_displayname}
        created_by_user_email={created_by_user_email}
      />
      {Boolean(vitData) && <VisualizationWrapper vitData={vitData} />}
    </>
  );
}

export default Preview;
