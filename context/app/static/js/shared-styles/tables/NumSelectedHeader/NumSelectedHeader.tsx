import React from 'react';
import Typography from '@mui/material/Typography';
import { HeaderWrapper } from 'js/shared-styles/tables/NumSelectedHeader/style';

function NumSelectedHeader({ numSelected, ...props }: { numSelected: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeaderWrapper {...props}>
      <Typography
        fontWeight="500"
        sx={(theme) => ({ color: numSelected === 0 ? theme.palette.grey[500] : theme.palette.primary.main })}
      >
        {`${numSelected} selected`}
      </Typography>
    </HeaderWrapper>
  );
}

export default NumSelectedHeader;
