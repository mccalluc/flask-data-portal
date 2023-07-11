import React, { useState, useMemo, useCallback } from 'react';

import SectionHeader from 'js/shared-styles/sections/SectionHeader';
import { FilesContext, useDetailContext } from 'js/components/Contexts';
import { DetailPageSection } from 'js/components/detailPage/style';
import FileBrowserDUA from './FileBrowserDUA';
import BulkDataTransferPanels from './BulkDataTransferPanels';
import { StyledContainer } from './style';

function BulkDataTransfer() {
  const { mapped_data_access_level } = useDetailContext();
  const localStorageKey = `has_agreed_to_${mapped_data_access_level}_DUA`;
  const [hasAgreedToDUA, agreeToDUA] = useState(localStorage.getItem(localStorageKey));
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [urlClickedBeforeDUA, setUrlClickedBeforeDUA] = useState('');

  const handleDUAAgree = useCallback(() => {
    agreeToDUA(true);
    localStorage.setItem(localStorageKey, true);
    setDialogOpen(false);
    window.open(urlClickedBeforeDUA, '_blank');
  }, [agreeToDUA, localStorageKey, setDialogOpen, urlClickedBeforeDUA]);

  const handleDUAClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const openDUA = useCallback((linkUrl) => {
    setDialogOpen(true);
    setUrlClickedBeforeDUA(linkUrl);
  }, []);

  const filesContext = useMemo(() => ({ openDUA, hasAgreedToDUA }), [openDUA, hasAgreedToDUA]);

  return (
    <FilesContext.Provider value={filesContext}>
      <DetailPageSection id="bulk-data-transfer" data-testid="bulk-data-transfer">
        <SectionHeader>Bulk Data Transfer</SectionHeader>
        <StyledContainer>
          <BulkDataTransferPanels />
        </StyledContainer>
      </DetailPageSection>
      <FileBrowserDUA
        isOpen={isDialogOpen}
        handleAgree={handleDUAAgree}
        handleClose={handleDUAClose}
        mapped_data_access_level={mapped_data_access_level}
      />
    </FilesContext.Provider>
  );
}

export default BulkDataTransfer;
