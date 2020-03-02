import React from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Container } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { useStyles } from './styles';

export default function Header() {
  const classes = useStyles();

  return (
    <AppBar className={classes.MuiAppBar} position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar>
          <a href={"/"}><HubmapType className={classes.hubmaptypeLight}/></a>
          <Typography variant="h5" className={classes.title}/>
          <Button>
            <a href={"/browse/donor"} className="navLink">
              Donors
            </a>
          </Button>
          <Button>
            <a href={"/browse/sample"} className="navLink">
              Samples
            </a>
          </Button>
          <Button>
            <a href={"/browse/dataset"} className="navLink">
              Assays
            </a>
          </Button>
          <Button>
            <a href={"/help"} className="navLink">
              Help
            </a>
          </Button>
          <Button>
            <a href={"/login"} className="navLink">
              Login
            </a>
          </Button>
          {/*<Button>*/}
          {/*  <a href={"/logout"}>*/}
          {/*    Logout*/}
          {/*  </a>*/}
          {/*</Button>*/}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function HubmapType(props) {
  return (
    <svg viewBox="0 0 700 162" className={props.className}>
      <path d="M99.9,0.47v161.37H56.26V94.06H43.2v67.78H-0.44V0.47H43.2v57.71h13.06V0.47H99.9z M212.06,29.57v132.26h-42.6l0.73-10.99
      c-2.9,4.46-6.48,7.8-10.73,10.04c-4.25,2.23-9.14,3.34-14.67,3.34c-6.29,0-11.51-1.06-15.65-3.19c-4.15-2.13-7.2-4.95-9.17-8.47
      c-1.97-3.52-3.2-7.19-3.68-11.01c-0.48-3.82-0.73-11.41-0.73-22.77V29.57h41.88v90c0,10.3,0.33,16.41,0.98,18.34
      c0.66,1.93,2.44,2.89,5.34,2.89c3.11,0,4.96-1,5.55-2.99c0.59-1.99,0.88-8.41,0.88-19.24V29.57H212.06z M228.33,0.47h43.54
      c13.75,0,24.17,1.03,31.25,3.09c7.08,2.06,12.8,6.23,17.15,12.5c4.35,6.28,6.53,16.38,6.53,30.33c0,9.43-1.54,16-4.61,19.72
      c-3.08,3.72-9.14,6.57-18.19,8.57c10.09,2.19,16.93,5.83,20.53,10.92c3.59,5.09,5.39,12.88,5.39,23.39v14.96
      c0,10.91-1.3,18.98-3.89,24.23c-2.59,5.25-6.72,8.84-12.39,10.77c-5.67,1.93-17.28,2.89-34.83,2.89h-50.48V0.47z M271.97,28.08
      v35.88c1.87-0.07,3.32-0.1,4.35-0.1c4.28,0,7.01-1.01,8.19-3.04c1.17-2.03,1.76-7.82,1.76-17.39c0-5.05-0.48-8.59-1.45-10.61
      c-0.97-2.03-2.23-3.3-3.78-3.84C279.48,28.44,276.46,28.15,271.97,28.08z M271.97,89.08v45.15c6.15-0.2,10.07-1.13,11.77-2.79
      c1.69-1.66,2.54-5.75,2.54-12.26v-15.05c0-6.91-0.76-11.1-2.28-12.56C282.47,90.11,278.46,89.28,271.97,89.08z M480.22,0.47v161.37
      h-38.15L442.02,52.9l-15.19,108.94h-27.06L383.76,55.39l-0.05,106.45h-38.15V0.47h56.47c1.68,9.7,3.4,21.14,5.18,34.31l6.2,41.05
      l10.03-75.35H480.22z M573.17,0.47l24.96,161.37h-44.6l-2.34-29h-15.61l-2.62,29h-45.12L510.1,0.47H573.17z M550.04,104.23
      c-2.21-18.28-4.42-40.87-6.65-67.78c-4.45,30.9-7.24,53.49-8.38,67.78H550.04z M605.54,0.47h43.95c11.88,0,21.03,0.9,27.42,2.69
      c6.39,1.79,11.19,4.39,14.41,7.77s5.39,7.49,6.53,12.31c1.14,4.82,1.71,12.28,1.71,22.38v14.05c0,10.3-1.11,17.81-3.32,22.53
      c-2.21,4.72-6.27,8.34-12.18,10.86c-5.91,2.53-13.63,3.79-23.17,3.79h-11.71v64.99h-43.64V0.47z M649.18,28.08v41.06
      c1.24,0.07,2.31,0.1,3.21,0.1c4.01,0,6.79-0.95,8.34-2.84c1.55-1.89,2.33-5.83,2.33-11.81V41.34c0-5.52-0.9-9.1-2.7-10.76
      C658.58,28.91,654.84,28.08,649.18,28.08z"/>
    </svg>
  );
};