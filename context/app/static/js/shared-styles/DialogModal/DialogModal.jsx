import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import MUIDialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Typography from '@mui/material/Typography';

import { Alert } from 'js/shared-styles/alerts';
import { StyledDivider, StyledDialogTitle } from './style';

function DialogModal({
  title,
  warning,
  secondaryText,
  content,
  actions,
  isOpen,
  handleClose,
  DialogContentComponent,
  errorMessage,
  ...props
}) {
  const DialogContent = DialogContentComponent || MUIDialogContent;

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth {...props}>
      <StyledDialogTitle disableTypography>
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
      </StyledDialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert $marginBottom={20} severity="error">
            {errorMessage}
          </Alert>
        )}
        {secondaryText && (
          <DialogContentText color="primary" variant="subtitle2">
            {secondaryText}
          </DialogContentText>
        )}
        {warning && (
          <DialogContentText color="error" variant="body2">
            {warning}
          </DialogContentText>
        )}
        {content}
      </DialogContent>
      <StyledDivider />
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
}

export default DialogModal;
