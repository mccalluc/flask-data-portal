import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { DetailSectionPaper } from 'js/shared-styles/surfaces';
import DetailContext from 'js/components/Detail/context';
import SectionHeader from 'js/shared-styles/sections/SectionHeader';
import SectionContainer from 'js/shared-styles/sections/SectionContainer';
import GlobusLink from '../GlobusLink';
import { MarginTopDiv } from '../GlobusLink/style'; // TODO: Move to this component's style.js.
import FileBrowser from '../FileBrowser';
import FileBrowserDUA from '../FileBrowserDUA';
import FilesContext from './context';

function Files(props) {
  const { files, uuid, hubmap_id, visLiftedUUID } = props;

  const { mapped_data_access_level } = useContext(DetailContext);

  const localStorageKey = `has_agreed_to_${mapped_data_access_level}_DUA`;
  const [hasAgreedToDUA, agreeToDUA] = useState(localStorage.getItem(localStorageKey));
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [urlClickedBeforeDUA, setUrlClickedBeforeDUA] = useState('');

  function handleDUAAgree() {
    agreeToDUA(true);
    localStorage.setItem(localStorageKey, true);
    setDialogOpen(false);
    window.open(urlClickedBeforeDUA, '_blank');
  }

  function handleDUAClose() {
    setDialogOpen(false);
  }

  function openDUA(linkUrl) {
    setDialogOpen(true);
    setUrlClickedBeforeDUA(linkUrl);
  }

  return (
    <FilesContext.Provider value={{ openDUA, hasAgreedToDUA }}>
      <SectionContainer id="files">
        <SectionHeader>Files</SectionHeader>
        {files && <FileBrowser files={files} />}
        <MarginTopDiv>
          <DetailSectionPaper>
            <GlobusLink uuid={uuid} hubmap_id={hubmap_id} />
            {visLiftedUUID && <GlobusLink uuid={visLiftedUUID} isSupport />}
          </DetailSectionPaper>
        </MarginTopDiv>
        <FileBrowserDUA
          isOpen={isDialogOpen}
          handleAgree={handleDUAAgree}
          handleClose={handleDUAClose}
          mapped_data_access_level={mapped_data_access_level}
        />
      </SectionContainer>
    </FilesContext.Provider>
  );
}

Files.propTypes = {
  uuid: PropTypes.string.isRequired,
  hubmap_id: PropTypes.string.isRequired,
  visLiftedUUID: PropTypes.string,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      rel_path: PropTypes.string.isRequired,
      edam_term: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      is_qa_qc: PropTypes.bool,
    }),
  ),
};

Files.defaultProps = {
  files: undefined,
  visLiftedUUID: undefined,
};

export default Files;
