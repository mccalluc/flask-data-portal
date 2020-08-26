import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --header-height: 60px;
  }

  body {
    left: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  li {
    list-style: none;
  }

  .main-content {
    flex-grow: 1;
    display: flex;
  }

  #react-content {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  .container-lg {
    max-width: 1240px;
  }
  a {
    text-decoration: none;
    background-color: transparent;
}
`;

export default GlobalStyles;
