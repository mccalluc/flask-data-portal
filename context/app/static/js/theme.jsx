import { createMuiTheme } from '@material-ui/core/styles';

const purple = '#444A65';
const blue = '#3781D1';

// default HuBMAP color and font theme
const theme = createMuiTheme({
  palette: {
    primary: {
      main: purple,
      hover: 'brightness(108%)',
      light: '#696e83',
      dark: '#2f3346',
    },
    secondary: {
      main: '#636363',
      light: '#828282',
      dark: '#454545',
    },
    error: {
      main: '#DA348A',
      light: '#e15ca1',
      dark: '#982460',
    },
    warning: {
      main: '#D25435',
      light: '#db765d',
      dark: '#933a25',
    },
    info: {
      main: blue,
      light: '#5f9ada',
      dark: '#265a92',
    },
    link: {
      main: blue,
    },
    success: {
      main: '#6C8938', // '#9BC551'
      light: '#89a05f',
      dark: '#4b5f27',
    },
    white: {
      main: '#fff',
      hover: 'brightness(96%)',
    },
    halfShadow: {
      main: 'rgb(0, 0, 0, 0.54)',
    },
    action: {
      disabled: 'rgba(0,0,0, 0.38)',
    },
    hoverShadow: {
      main: 'rgb(0, 0, 0, 0.08)',
    },
    transparentGray: {
      main: 'rgba(144, 144, 144, 0.1)',
    },
    type: 'light',
  },
  typography: {
    fontFamily: 'Inter Variable, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.6rem',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2.3rem',
    },
    h3: {
      fontWeight: 300,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 300,
      fontSize: '1.6rem',
    },
    h5: {
      fontWeight: 300,
      fontSize: '1.3rem',
    },
    h6: {
      fontWeight: 300,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1.1rem',
      color: purple,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: purple,
    },
    body1: {
      fontWeight: 300,
      fontSize: '0.95rem',
    },
    body2: {
      fontWeight: 300,
      fontSize: '0.8rem',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 300,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'capitalize',
    },
  },
  shape: {
    borderRadius: 2,
  },
  zIndex: {
    tutorial: 1101, // one higher than AppBar zIndex provided by MUI
    dropdownOffset: 1001,
    entityHeader: 1000,
    dropdown: 50,
    visualization: 3,
    fileBrowserHeader: 1,
    interactiveContentAboveDetailSection: 1, // Puts the component above the section container otherwise the component will not be interactive due to overlap from the section container anchor link offset.
  },
});

export default theme;
