import React from 'react';
// import { useTheme } from '@material-ui/core/styles';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { Wrapper } from './style';

function TwitterTimeline() {
  return (
    <Wrapper>
      <TwitterTimelineEmbed sourceType="profile" screenName="_hubmap" transparent autoHeight />
    </Wrapper>
  );
}

export default TwitterTimeline;
