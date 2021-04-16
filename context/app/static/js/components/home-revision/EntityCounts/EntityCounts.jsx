import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'js/components/Providers';

import EntityCount from 'js/components/home-revision/EntityCount';
import { DatasetIcon, SampleIcon, DonorIcon, CollectionIcon } from 'js/shared-styles/icons';
import useSearchData from 'js/hooks/useSearchData';
import { Background, FlexContainer } from './style';

const entityCountsQuery = {
  size: 0,
  aggs: { entity_type: { terms: { field: 'entity_type.keyword' } } },
};

function EntityCounts() {
  const { elasticsearchEndpoint, nexusToken } = useContext(AppContext);
  const [entityCounts, setEntityCountsData] = useState(undefined);
  const { searchData: elasticsearchData } = useSearchData(entityCountsQuery, elasticsearchEndpoint, nexusToken);
  useEffect(() => {
    if (Object.keys(elasticsearchData).length) {
      const entityCountsObject = elasticsearchData.aggregations.entity_type.buckets.reduce((acc, entity) => {
        const accCopy = acc;
        accCopy[entity.key] = entity.doc_count;
        return accCopy;
      }, {});
      setEntityCountsData(entityCountsObject);
    }
  }, [elasticsearchData]);

  return (
    <Background>
      <FlexContainer>
        <EntityCount icon={DonorIcon} count={entityCounts?.Donor} label="Donors" href="/search?entity_type[0]=Donor" />
        <EntityCount
          icon={SampleIcon}
          count={entityCounts?.Sample}
          label="Samples"
          href="/search?entity_type[0]=Sample"
        />
        <EntityCount
          icon={DatasetIcon}
          count={entityCounts?.Dataset}
          label="Datasets"
          href="/search?entity_type[0]=Dataset"
        />
        <EntityCount icon={CollectionIcon} count={entityCounts?.Collection} label="Collections" href="/collections" />
      </FlexContainer>
    </Background>
  );
}

export default EntityCounts;
