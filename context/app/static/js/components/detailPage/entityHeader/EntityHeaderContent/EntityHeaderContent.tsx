import React from 'react';
import { animated, useSpring } from '@react-spring/web';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import VizualizationThemeSwitch from 'js/components/detailPage/visualization/VisualizationThemeSwitch';
import VisualizationCollapseButton from 'js/components/detailPage/visualization/VisualizationCollapseButton';
import VisualizationNotebookButton from 'js/components/detailPage/visualization/VisualizationNotebookButton';
import { AllEntityTypes, entityIconMap } from 'js/shared-styles/icons/entityIconMap';
import useVisualizationStore from 'js/stores/useVisualizationStore';
import { useHandleCopyClick } from 'js/hooks/useCopyText';
import { TooltipIconButton } from 'js/shared-styles/buttons/TooltipButton';

import { Entity } from 'js/components/types';
import { StyledSvgIcon, FlexContainer, RightDiv } from './style';
import EntityHeaderItem from '../EntityHeaderItem';
import VisualizationShareButtonWrapper from '../VisualizationShareButtonWrapper';
import EntityHeaderActionButtons from '../EntityHeaderActionButtons';

type EntityTypesWithIcons = Exclude<
  keyof typeof entityIconMap,
  'Support' | 'Collection' | 'Workspace' | 'VerifiedUser'
>;

export interface AssayMetadata extends Pick<Entity, 'mapped_data_access_level'> {
  sex: string;
  race: string[];
  age_value: string;
  age_unit: string;
  mapped_organ: string;
  sample_category: string;
  mapped_data_types: string[];
  title: string;
  publication_venue: string;
  hubmap_id: string;
  entity_type: AllEntityTypes;
  name: string;
  reference_link: React.ReactNode;
  uuid: string;
}

type EntityToFieldsType = Record<
  EntityTypesWithIcons,
  Record<string, (assayMetadata: Partial<AssayMetadata>) => React.ReactNode>
>;

const entityTypeHasIcon = (entityType: string): entityType is EntityTypesWithIcons => {
  return entityType in entityIconMap;
};

const entityToFieldsMap: EntityToFieldsType = {
  Donor: {
    sex: ({ sex }) => sex,
    race: ({ race }) => race?.join(', '),
    age: ({ age_value, age_unit }) => (age_value && age_unit ? `${age_value} ${age_unit}` : ''),
  },
  Sample: {
    'organ type': ({ mapped_organ }) => mapped_organ,
    'sample category': ({ sample_category }) => sample_category,
  },
  Dataset: {
    'organ type': ({ mapped_organ }) => mapped_organ,
    'data type': ({ mapped_data_types }) => mapped_data_types?.join(', '),
  },
  Publication: {
    title: ({ title }) => title,
    'publication venue': ({ publication_venue }) => publication_venue,
  },
  CellType: {
    name: ({ name }) => name,
    reference_link: ({ reference_link }) => reference_link,
  },
  Gene: {
    name: ({ name }) => name,
  },
};

const AnimatedFlexContainer = animated(FlexContainer);

const vizNotebookIdSelector: (state: { vizNotebookId: string | null }) => string | null = (state) =>
  state.vizNotebookId;

interface EntityHeaderContentProps {
  assayMetadata: Partial<AssayMetadata>;
  shouldDisplayHeader: boolean;
  vizIsFullscreen: boolean;
}

function HuBMAPIDItem({ hubmap_id }: Pick<Entity, 'hubmap_id'>) {
  const handleCopyClick = useHandleCopyClick();

  return (
    <EntityHeaderItem text={hubmap_id}>
      <TooltipIconButton onClick={() => handleCopyClick(hubmap_id)} tooltip="Copy HuBMAP ID">
        <ContentCopyIcon sx={(theme) => ({ color: theme.palette.common.link, fontSize: '1.25rem' })} />
      </TooltipIconButton>
    </EntityHeaderItem>
  );
}

function EntityHeaderContent({ assayMetadata, shouldDisplayHeader, vizIsFullscreen }: EntityHeaderContentProps) {
  const styles = useSpring({
    opacity: shouldDisplayHeader || vizIsFullscreen ? 1 : 0,
  });

  const { hubmap_id, entity_type, uuid, mapped_data_access_level } = assayMetadata;

  const vizNotebookId = useVisualizationStore(vizNotebookIdSelector);

  return (
    <AnimatedFlexContainer style={styles} maxWidth={vizIsFullscreen ? false : 'lg'}>
      {entity_type && (
        <>
          <StyledSvgIcon component={entityIconMap[entity_type]} />
          {hubmap_id && <HuBMAPIDItem hubmap_id={hubmap_id} />}
          {entityTypeHasIcon(entity_type) && entityToFieldsMap[entity_type]
            ? Object.entries(entityToFieldsMap[entity_type]).map(([label, fn]) => {
                const text = fn(assayMetadata);
                return React.isValidElement(text) ? <EntityHeaderItem text={text} key={label} /> : null;
              })
            : null}
        </>
      )}
      <RightDiv>
        {vizIsFullscreen ? (
          <>
            {vizNotebookId && <VisualizationNotebookButton uuid={vizNotebookId} />}
            <VisualizationShareButtonWrapper />
            <VizualizationThemeSwitch />
            <VisualizationCollapseButton />
          </>
        ) : (
          <EntityHeaderActionButtons
            showJsonButton
            entityCanBeSaved
            uuid={uuid}
            entity_type={entity_type}
            hubmap_id={hubmap_id}
            mapped_data_access_level={mapped_data_access_level}
          />
        )}
      </RightDiv>
    </AnimatedFlexContainer>
  );
}

export default EntityHeaderContent;
