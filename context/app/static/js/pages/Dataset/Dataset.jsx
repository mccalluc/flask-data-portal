import React, { useEffect, useContext } from 'react';

import { AppContext } from 'js/components/Providers';
import { LightBlueLink } from 'js/shared-styles/Links';
import Files from 'js/components/detailPage/files/Files';
import ProvSection from 'js/components/detailPage/provenance/ProvSection';
import Summary from 'js/components/detailPage/summary/Summary';
import Attribution from 'js/components/detailPage/Attribution';
import Protocol from 'js/components/detailPage/Protocol';
import MetadataTable from 'js/components/detailPage/MetadataTable';
import VisualizationWrapper from 'js/components/detailPage/visualization/VisualizationWrapper';
import DetailLayout from 'js/components/detailPage/DetailLayout';
import SummaryItem from 'js/components/detailPage/summary/SummaryItem';
import ContributorsTable from 'js/components/detailPage/ContributorsTable';
import useSendUUIDEvent from 'js/components/detailPage/useSendUUIDEvent';
import useEntityStore from 'js/stores/useEntityStore';
import CollectionsSection from 'js/components/detailPage/CollectionsSection';
import SupportAlert from 'js/components/detailPage/SupportAlert';
import { DetailPageAlert } from 'js/components/detailPage/style';
import { useSearchHits } from 'js/hooks/useSearchData';
import useVitessceConfig from 'js/hooks/useVitessceConfig';
import { getAllCollectionsQuery } from 'js/helpers/queries';

// TODO use this context for components other than FileBrowser
import DetailContext from 'js/components/detailPage/context';
import { getSectionOrder } from 'js/components/detailPage/utils';

import { combineMetadata, getCollectionsWhichContainDataset } from 'js/pages/utils/entity-utils';
import OutboundIconLink from 'js/shared-styles/Links/iconLinks/OutboundIconLink';

function SummaryDataChildren({ mapped_data_types, origin_sample, doi_url, registered_doi }) {
  return (
    <>
      <SummaryItem>
        <LightBlueLink variant="h6" href="https://software.docs.hubmapconsortium.org/assays" underline="none">
          {mapped_data_types}
        </LightBlueLink>
      </SummaryItem>
      <SummaryItem showDivider={Boolean(doi_url)}>
        <LightBlueLink variant="h6" href="/organ" underline="none">
          {origin_sample.mapped_organ}
        </LightBlueLink>
      </SummaryItem>
      {doi_url && (
        <OutboundIconLink isOutbound href={doi_url} variant="h6" iconFontSize="1.1rem">
          doi:{registered_doi}
        </OutboundIconLink>
      )}
    </>
  );
}

const entityStoreSelector = (state) => state.setAssayMetadata;

function DatasetDetail(props) {
  const { assayMetadata, visLiftedUUID } = props;
  const {
    protocol_url,
    metadata,
    files,
    donor,
    source_sample,
    uuid,
    data_types,
    mapped_data_types,
    origin_sample,
    origin_sample: { mapped_organ },
    group_name,
    created_by_user_displayname,
    created_by_user_email,
    hubmap_id,
    entity_type,
    created_timestamp,
    last_modified_timestamp,
    published_timestamp,
    description,
    status,
    sub_status,
    mapped_data_access_level,
    mapped_external_group_name,
    registered_doi,
    doi_url,
    contributors,
  } = assayMetadata;
  const isLatest = !('next_revision_uuid' in assayMetadata);

  const combinedStatus = sub_status || status;

  const combinedMetadata = combineMetadata(donor, origin_sample, source_sample, metadata);

  const { searchHits: allCollections } = useSearchHits(getAllCollectionsQuery);
  const collectionsData = getCollectionsWhichContainDataset(uuid, allCollections);

  const { groupsToken } = useContext(AppContext);
  const vitData = useVitessceConfig(uuid, groupsToken);

  const shouldDisplaySection = {
    provenance: entity_type !== 'Support',
    visualization: Boolean(vitData),
    protocols: Boolean(protocol_url),
    metadata: Boolean(Object.keys(combinedMetadata).length),
    files: true,
    collections: Boolean(collectionsData.length),
    contributors: contributors && Boolean(contributors.length),
  };

  const sectionOrder = getSectionOrder(
    [
      'summary',
      'visualization',
      'provenance',
      'protocols',
      'metadata',
      'files',
      'collections',
      'contributors',
      'attribution',
    ],
    shouldDisplaySection,
  );

  useSendUUIDEvent(entity_type, uuid);

  const setAssayMetadata = useEntityStore(entityStoreSelector);
  useEffect(() => {
    setAssayMetadata({ hubmap_id, entity_type, mapped_data_types, mapped_organ });
  }, [setAssayMetadata, hubmap_id, entity_type, mapped_data_types, mapped_organ]);

  // TODO: When all environments are clean, data_types array fallbacks shouldn't be needed.
  return (
    <DetailContext.Provider value={{ hubmap_id, uuid, mapped_data_access_level }}>
      {!isLatest && (
        <DetailPageAlert severity="warning" $marginBottom="16">
          <span>
            {/* <span> to override "display: flex" which splits this on to multiple lines. */}
            You are viewing an older version of this page. Navigate to the{' '}
            <LightBlueLink href={`/browse/latest/dataset/${uuid}`}>latest version</LightBlueLink>.
          </span>
        </DetailPageAlert>
      )}
      {mapped_external_group_name && (
        <DetailPageAlert severity="info" $marginBottom="16">
          You are viewing an external dataset that was not generated by the HuBMAP Consortium.
        </DetailPageAlert>
      )}
      {entity_type === 'Support' && <SupportAlert uuid={uuid} />}
      <DetailLayout sectionOrder={sectionOrder}>
        <Summary
          uuid={uuid}
          entity_type={entity_type}
          hubmap_id={hubmap_id}
          created_timestamp={created_timestamp}
          last_modified_timestamp={last_modified_timestamp}
          published_timestamp={published_timestamp}
          description={description}
          status={combinedStatus}
          mapped_data_access_level={mapped_data_access_level}
          mapped_external_group_name={mapped_external_group_name}
        >
          <SummaryDataChildren
            data_types={data_types || []}
            mapped_data_types={mapped_data_types || []}
            origin_sample={origin_sample}
            registered_doi={registered_doi}
            doi_url={doi_url}
          />
        </Summary>
        {shouldDisplaySection.visualization && <VisualizationWrapper vitData={vitData} uuid={uuid} />}
        {shouldDisplaySection.provenance && <ProvSection uuid={uuid} assayMetadata={assayMetadata} />}
        {shouldDisplaySection.protocols && <Protocol protocol_url={protocol_url} />}
        {shouldDisplaySection.metadata && <MetadataTable metadata={combinedMetadata} hubmap_id={hubmap_id} />}
        <Files files={files} uuid={uuid} hubmap_id={hubmap_id} visLiftedUUID={visLiftedUUID} />
        {shouldDisplaySection.collections && <CollectionsSection collectionsData={collectionsData} />}
        {shouldDisplaySection.contributors && <ContributorsTable contributors={contributors} title="Contributors" />}
        <Attribution
          group_name={group_name}
          created_by_user_displayname={created_by_user_displayname}
          created_by_user_email={created_by_user_email}
        />
      </DetailLayout>
    </DetailContext.Provider>
  );
}

export default DatasetDetail;
