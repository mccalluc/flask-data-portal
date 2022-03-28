import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';

import { LightBlueLink } from 'js/shared-styles/Links';
import ProvSection from 'js/components/detailPage/provenance/ProvSection';
import Summary from 'js/components/detailPage/summary/Summary';
import Protocol from 'js/components/detailPage/Protocol';
import SummaryItem from 'js/components/detailPage/summary/SummaryItem';
import DetailLayout from 'js/components/detailPage/DetailLayout';
import MetadataTable from 'js/components/detailPage/MetadataTable';
import SampleTissue from 'js/components/detailPage/SampleTissue';
import useSendUUIDEvent from 'js/components/detailPage/useSendUUIDEvent';
import useEntityStore from 'js/stores/useEntityStore';
import DetailContext from 'js/components/detailPage/context';
import { getSectionOrder } from 'js/components/detailPage/utils';
import { useDerivedDatasetSearchHits } from 'js/hooks/useDerivedEntitySearchHits';
import DerivedDatasetsSection from 'js/components/detailPage/derivedEntities/DerivedDatasetsSection';

import { combineMetadata } from 'js/pages/utils/entity-utils';

const entityStoreSelector = (state) => state.setAssayMetadata;

function SampleDetail(props) {
  const { assayMetadata } = props;
  const {
    uuid,
    donor,
    protocol_url,
    mapped_specimen_type,
    origin_sample: { mapped_organ },
    group_name,
    hubmap_id,
    entity_type,
    created_timestamp,
    last_modified_timestamp,
    description,
    metadata,
    rui_location,
    descendant_counts,
  } = assayMetadata;

  const { searchHits: derivedDatasets, isLoading: derivedDatsetsAreLoading } = useDerivedDatasetSearchHits(uuid);

  const combinedMetadata = combineMetadata(donor, undefined, undefined, metadata);

  const shouldDisplaySection = {
    protocols: Boolean(protocol_url),
    tissue: true,
    metadata: Boolean(Object.keys(combinedMetadata).length),
    derived: Boolean(descendant_counts?.entity_type?.Dataset > 0),
  };

  const sectionOrder = getSectionOrder(
    ['summary', 'derived', 'tissue', 'provenance', 'protocols', 'metadata'],
    shouldDisplaySection,
  );

  const setAssayMetadata = useEntityStore(entityStoreSelector);
  useEffect(() => {
    setAssayMetadata({ hubmap_id, entity_type, mapped_organ, mapped_specimen_type });
  }, [setAssayMetadata, hubmap_id, entity_type, mapped_organ, mapped_specimen_type]);

  useSendUUIDEvent(entity_type, uuid);

  const hasRUI = Boolean(rui_location);

  return (
    <DetailContext.Provider value={{ hubmap_id, uuid }}>
      <DetailLayout sectionOrder={sectionOrder}>
        <Summary
          uuid={uuid}
          entity_type={entity_type}
          hubmap_id={hubmap_id}
          created_timestamp={created_timestamp}
          last_modified_timestamp={last_modified_timestamp}
          description={description}
          group_name={group_name}
        >
          <SummaryItem>
            <LightBlueLink variant="h6" href="/organ" underline="none">
              {mapped_organ}
            </LightBlueLink>
          </SummaryItem>
          <Typography variant="h6" component="p">
            {mapped_specimen_type}
          </Typography>
        </Summary>
        {shouldDisplaySection.derived && (
          <DerivedDatasetsSection
            datasets={derivedDatasets}
            uuid={uuid}
            isLoading={derivedDatsetsAreLoading}
            sectionId="derived"
          />
        )}
        <SampleTissue
          uuid={uuid}
          mapped_specimen_type={mapped_specimen_type}
          mapped_organ={mapped_organ}
          hasRUI={hasRUI}
        />
        <ProvSection uuid={uuid} assayMetadata={assayMetadata} />
        {shouldDisplaySection.protocols && <Protocol protocol_url={protocol_url} />}
        {shouldDisplaySection.metadata && <MetadataTable metadata={combinedMetadata} hubmap_id={hubmap_id} />}
      </DetailLayout>
    </DetailContext.Provider>
  );
}

export default SampleDetail;
