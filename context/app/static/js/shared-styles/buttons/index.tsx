import React, { PropsWithChildren, ComponentProps, useId } from 'react';
import { Theme, styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import { TooltipIconButton } from 'js/shared-styles/buttons/TooltipButton';
import { SecondaryBackgroundTooltip } from '../tooltips';
import IconDropdownMenuButton from '../dropdowns/IconDropdownMenuButton';

const iconButtonHeight = 40;

const whiteBackgroundCSS = {
  backgroundColor: '#fff',
  height: `${iconButtonHeight}px`,
  width: `${iconButtonHeight}px`,
  borderRadius: '4px',
  padding: '0px',
};

const border = (theme: Theme) => ({
  border: `1px solid ${theme.palette.divider}`,
});

const svgStyles = {
  fontSize: '1.25rem',
};

const WhiteBackgroundIconButton = styled(IconButton)<IconButtonProps>(({ theme, disabled }) => ({
  ...whiteBackgroundCSS,
  ...border(theme),
  '& svg': svgStyles,
  ...(disabled && {
    backgroundColor: theme.palette.action.disabledBackground,
  }),
}));

const WhiteBackgroundIconDropdownMenuButton = styled(IconDropdownMenuButton)(({ theme }) => ({
  ...border(theme),
}));

const RotatedTooltipButton = styled(IconDropdownMenuButton)(({ theme }) => ({
  ...whiteBackgroundCSS,
  color: theme.palette.primary.main,
  transform: 'rotate(90deg)',
  fontSize: '1.5rem',
  border: 'none',
  sx: { border: 0 },
  '& svg': svgStyles,
}));

const WhiteBackgroundIconTooltipButton = styled(TooltipIconButton)(({ theme }) => ({
  ...border(theme),
  ...whiteBackgroundCSS,
  '& svg': svgStyles,
}));

const WhiteBackgroundToggleButton = styled(ToggleButton)({
  ...whiteBackgroundCSS,
  border: 0,
  '& svg': svgStyles,
});

interface TooltipToggleButtonProps extends PropsWithChildren, ComponentProps<typeof WhiteBackgroundToggleButton> {
  tooltipComponent?: React.ElementType;
  tooltipTitle: string;
  id: string;
}

function TooltipToggleButton({
  children,
  tooltipComponent = SecondaryBackgroundTooltip,
  tooltipTitle,
  id,
  ...rest
}: TooltipToggleButtonProps) {
  const Tooltip = tooltipComponent;
  const tooltipId = useId();

  return (
    <Tooltip title={tooltipTitle} id={tooltipId}>
      <span aria-describedby={tooltipId}>
        <WhiteBackgroundToggleButton {...rest} id={id} data-testid={id}>
          {children}
        </WhiteBackgroundToggleButton>
      </span>
    </Tooltip>
  );
}

const WhiteTextButton = styled(Button)({
  color: '#fff',
});

export default TooltipToggleButton;

export {
  WhiteBackgroundIconButton,
  WhiteBackgroundIconDropdownMenuButton,
  WhiteBackgroundIconTooltipButton,
  RotatedTooltipButton,
  TooltipToggleButton,
  iconButtonHeight,
  WhiteTextButton,
};
