import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/MenuRounded';
import CloseIcon from '@material-ui/icons/CloseRounded';
import MenuList from '@material-ui/core/MenuList';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDownRounded';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUpRounded';

import { WidePopper, WidePaper, DropdownMenuItem } from './style';
import DropdownLink from '../DropdownLink';

import ResourceLinks from '../ResourceLinks';
import AtlasToolsLinks from '../AtlasToolsLinks';
import DocumentationLinks from '../DocumentationLinks';

function DropdownContainer(props) {
  const { label, children } = props;
  const [isOpen, toggle] = useReducer((v) => !v, false);

  return (
    <>
      <DropdownMenuItem onClick={toggle}>
        {label}
        {isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </DropdownMenuItem>
      {isOpen && children}
    </>
  );
}

function Menu(props) {
  const [isOpen, toggle] = useReducer((v) => !v, false);
  const { anchorRef } = props;

  return (
    <>
      <IconButton color="inherit" aria-describedby="main-menu" aria-haspopup="true" onClick={toggle}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <WidePopper id="main-menu" open={isOpen} anchorEl={anchorRef.current}>
        <WidePaper>
          <MenuList>
            {['Donor', 'Sample', 'Dataset', 'Collection'].map((type) => (
              <DropdownLink key={type} href={`/search?entity_type[0]=${type}`}>{`${type}s`}</DropdownLink>
            ))}
            {[
              ['Resources', ResourceLinks],
              ['Atlas & Tools', AtlasToolsLinks],
              ['Documentation', DocumentationLinks],
            ].map(([label, Component]) => (
              <DropdownContainer label={label} key={label}>
                <Component isIndented />
              </DropdownContainer>
            ))}
          </MenuList>
          <DropdownLink href="/my-lists">My Lists</DropdownLink>
        </WidePaper>
      </WidePopper>
    </>
  );
}

Menu.propTypes = {
  anchorRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
};

export default Menu;
