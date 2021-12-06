import React from 'react';
import PropTypes from 'prop-types';
import { useTransition, animated } from 'react-spring';

import VizualizationThemeSwitch from 'js/components/detailPage/visualization/VisualizationThemeSwitch';
import VisualizationCollapseButton from 'js/components/detailPage/visualization/VisualizationCollapseButton';
import { StyledDatasetIcon, StyledSampleIcon, StyledDonorIcon, FlexContainer, RightDiv } from './style';
import VisualizationShareButtonWrapper from '../VisualizationShareButtonWrapper';

const iconMap = {
  Dataset: <StyledDatasetIcon />,
  Sample: <StyledSampleIcon />,
  Donor: <StyledDonorIcon />,
};

const AnimatedFlexContainer = animated(FlexContainer);

function EntityHeaderContent({ hubmap_id, entity_type, data, shouldDisplayHeader, vizIsFullscreen }) {
  const transitions = useTransition(shouldDisplayHeader, null, {
    from: { opacity: vizIsFullscreen ? 1 : 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <AnimatedFlexContainer style={props} key={key} maxWidth={vizIsFullscreen ? false : 'lg'}>
          {iconMap[entity_type]}
          {hubmap_id}
          {Object.values(data)
            .map((v) => v.value || `undefined ${v.label}`)
            .join(' | ')}
          {vizIsFullscreen && (
            <RightDiv>
              <VisualizationShareButtonWrapper />
              <VizualizationThemeSwitch />
              <VisualizationCollapseButton />
            </RightDiv>
          )}
        </AnimatedFlexContainer>
      ),
  );
}

EntityHeaderContent.propTypes = {
  hubmap_id: PropTypes.string,
  entity_type: PropTypes.string,
  data: PropTypes.objectOf(PropTypes.object),
  shouldDisplayHeader: PropTypes.bool.isRequired,
  vizIsFullscreen: PropTypes.bool.isRequired,
};

EntityHeaderContent.defaultProps = {
  hubmap_id: undefined,
  entity_type: undefined,
  data: {},
};

export default EntityHeaderContent;
