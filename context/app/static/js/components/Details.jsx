import React from 'react';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import VisTabs from './VisTabs';
import RecursiveList from './RecursiveList';

export default function Details(props) {
  const { assayMetaData, provData, vitData } = props;
  const generateListTemplate = (header, description) => (
    <li>
      <Box mb={2} mt={0}>
        <span className="list-header">{header}</span><br />
        {description}
      </Box>
    </li>
  );

  return (
    <Container maxWidth="lg">
      {/* eslint-disable-next-line react/jsx-boolean-value */}
      <ExpansionPanel defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="Details Panel" id="details-header">
          <Box className="expansion-header">{assayMetaData.description}</Box>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3} justify="flex-start" direction="row" alignItems="flex-start">
            <Grid item xs>
              <ul>
                {generateListTemplate('Contributor', assayMetaData.provenance_user_displayname)}
                {generateListTemplate('Group', assayMetaData.provenance_group_name)}
                {generateListTemplate('Type', 'Assay')}
              </ul>
            </Grid>
            <Grid item xs>
              <ul>
                {generateListTemplate('Assay ID', assayMetaData.display_doi)}
                {generateListTemplate('Created', assayMetaData.created)}
                {generateListTemplate('Modified', 'modified')}
              </ul>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <RecursiveList property={assayMetaData} propertyName="Root Property" isRoot />
      <Box mt={2}>
        <Paper>
          <VisTabs provData={provData} vitData={vitData} />
        </Paper>
      </Box>
    </Container>
  );
}
