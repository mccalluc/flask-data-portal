import React from 'react';
// import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import * as filterTypes from 'searchkit'; // eslint-disable-line import/no-duplicates
// There is more in the name space, but we only need the filterTypes.

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {
  InnerAccordion,
  InnerAccordionSummary,
  OuterAccordion,
  OuterAccordionSummary,
  StyledAccordionDetails,
} from './style';

function Accordions(props) {
  const { filters } = props;
  return Object.entries(filters).map(([title, filterGroup], i) => {
    const isFirst = i === 0;
    const innerAccordion = filterGroup.map((def) => {
      const Filter = filterTypes[def.type];
      /* eslint-disable react/jsx-props-no-spreading */
      return (
        <InnerAccordion key={def.props.title} defaultExpanded>
          <InnerAccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">{def.props.title}</Typography>
          </InnerAccordionSummary>
          <StyledAccordionDetails>
            <Filter {...def.props} />
          </StyledAccordionDetails>
        </InnerAccordion>
      );
      /* eslint-enable react/jsx-props-no-spreading */
    });
    if (!title) {
      // We leave the title blank for the group of facets
      // that need to be on the page for Searchkit,
      // but that we don't want to display.
      return (
        <div style={{ display: 'none' }} key="hidden">
          {innerAccordion}
        </div>
      );
    }
    return (
      <OuterAccordion key={title} defaultExpanded={isFirst}>
        <OuterAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{title}</Typography>
        </OuterAccordionSummary>
        <StyledAccordionDetails>{innerAccordion}</StyledAccordionDetails>
      </OuterAccordion>
    );
  });
}

export default Accordions;
