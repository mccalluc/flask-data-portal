import React from 'react';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import { FlexLink, StyledSvgIcon } from './style';

function EntityCount({ icon, count, label, href }) {
  return (
    <FlexLink href={href}>
      <StyledSvgIcon component={icon} color="primary" />
      <div>
        <Typography variant="h2" component="p">
          {count || <Skeleton />}
        </Typography>
        <Typography variant="h6" component="p">
          {label}
        </Typography>
      </div>
    </FlexLink>
  );
}

export default EntityCount;
