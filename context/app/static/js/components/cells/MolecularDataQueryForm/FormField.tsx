import React, { PropsWithChildren } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface FormFieldContainerProps extends PropsWithChildren {
  title: string;
}

export function FormFieldContainer({ title, children }: FormFieldContainerProps) {
  return (
    <Stack gap={2} p={2} component={Paper}>
      <Typography variant="subtitle1">{title}</Typography>
      {children}
    </Stack>
  );
}

export function FormFieldSubtitle({ children }: PropsWithChildren) {
  return <Typography variant="body2">{children}</Typography>;
}
