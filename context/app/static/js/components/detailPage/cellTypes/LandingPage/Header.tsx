import React from 'react';
import Box from '@mui/material/Box';
import { useCellTypesList } from '../hooks';

function Header() {
  const cellList = useCellTypesList();
  console.warn(cellList);
  return <Box />;
}

export default Header;
