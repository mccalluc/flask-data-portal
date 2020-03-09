import React from 'react';
import Box from '@material-ui/core/Box';
import { useStyles } from '../styles';
import ProvGraph from './ProvGraph';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

export default function VisTabs (props) {
  const provData = props.provData;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.tabsRoot}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Detail View Tabs"
        className={classes.tabs}>
        <Tab
          label="Visualizations"
          id="vertical-tab-0"
          aria-controls="vertical-tabpanel-0"/>
        <Tab
          label="Provenance"
          id="vertical-tab-1"
          aria-controls="vertical-tabpanel-1"/>
      </Tabs>
      <TabPanel value={value} index={0}>
        <span id={"vit-grid"}>
          Vit Place Holder
        </span>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <span id={"prov-vis-react"}>
          <ProvGraph provData={provData}></ProvGraph>
        </span>
      </TabPanel>
    </div>
  );
};
