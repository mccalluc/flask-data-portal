import { useMemo } from 'react';

import { useSearchHits } from 'js/hooks/useSearchData';
import { lastModifiedTimestampCol } from 'js/components/detailPage/derivedEntities/sharedColumns';

function getAncestorsQuery(descendantUUID) {
  return {
    bool: {
      filter: [
        {
          term: {
            descendant_ids: descendantUUID,
          },
        },
      ],
    },
  };
}

function useAncestorSearchHits(descendantUUID) {
  const query = useMemo(
    () => ({
      query: getAncestorsQuery(descendantUUID, 'dataset'),
      _source: [
        'uuid',
        'hubmap_id',
        'entity_type',
        'mapped_data_types',
        'status',
        'descendant_counts',
        'last_modified_timestamp',
        'mapped_metadata',
        'origin_samples_unique_mapped_organs',
        'sample_category',
      ],
      size: 10000,
    }),
    [descendantUUID],
  );

  return useSearchHits(query);
}

function usePublicationsRelatedEntities(uuid) {
  const { searchHits: ancestorHits, isLoading } = useAncestorSearchHits(uuid);

  const ancestorsSplitByEntityType = ancestorHits.reduce(
    (acc, ancestor) => {
      const {
        _source: { entity_type },
      } = ancestor;

      if (!entity_type) {
        return acc;
      }

      acc[entity_type].push(ancestor);
      return acc;
    },
    { Donor: [], Sample: [], Dataset: [] },
  );

  const entities = [
    {
      entityType: 'Donor',
      tabLabel: 'Donors',
      data: ancestorsSplitByEntityType.Donor,
      columns: [
        {
          id: 'mapped_metadata.age_value',
          label: 'Age',
          renderColumnCell: ({ mapped_metadata }) => mapped_metadata?.age_value,
        },
        {
          id: 'mapped_metadata.body_mass_index_value',
          label: 'BMI',
          renderColumnCell: ({ mapped_metadata }) => mapped_metadata?.body_mass_index_value,
        },
        {
          id: 'mapped_metadata.sex',
          label: 'Sex',
          renderColumnCell: ({ mapped_metadata }) => mapped_metadata?.sex,
        },
        {
          id: 'mapped_metadata.race',
          label: 'Race',
          renderColumnCell: ({ mapped_metadata }) => mapped_metadata?.race,
        },
        lastModifiedTimestampCol,
      ],
    },
    {
      entityType: 'Sample',
      tabLabel: 'Samples',
      data: ancestorsSplitByEntityType.Sample,
      columns: [
        {
          id: 'origin_samples_unique_mapped_organs.mapped_organ',
          label: 'Organ',
          renderColumnCell: ({ origin_samples_unique_mapped_organs }) => origin_samples_unique_mapped_organs.join(', '),
        },
        { id: 'sample_category', label: 'Sample Category', renderColumnCell: ({ sample_category }) => sample_category },
        lastModifiedTimestampCol,
      ],
    },

    {
      entityType: 'Dataset',
      tabLabel: 'Datasets',
      data: ancestorsSplitByEntityType.Dataset,
      columns: [
        {
          id: 'mapped_data_types',
          label: 'Data Types',
          renderColumnCell: ({ mapped_data_types }) => mapped_data_types.join(', '),
        },

        {
          id: 'origin_samples_unique_mapped_organs.mapped_organ',
          label: 'Organ',
          renderColumnCell: ({ origin_samples_unique_mapped_organs }) => origin_samples_unique_mapped_organs.join(', '),
        },
        { id: 'status', label: 'Status', renderColumnCell: ({ status }) => status },
        lastModifiedTimestampCol,
      ],
    },
  ];

  return { entities, isLoading };
}

export { usePublicationsRelatedEntities };
