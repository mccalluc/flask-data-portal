import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { AppContext } from 'js/components/Providers';
import Tile from 'js/shared-styles/tiles/Tile/';
import { DatasetIcon } from 'js/shared-styles/icons';
import { entityIconMap } from 'js/shared-styles/icons/entityIconMap';
import EntityTileFooter from '../EntityTileFooter';
import EntityTileBody from '../EntityTileBody';
import { StyledIcon, Flex, LetterboxedThumbnail } from './style';

const tileWidth = 310;

function EntityTile({ uuid, entity_type, id, invertColors, entityData, descendantCounts }) {
  const { thumbnail_file } = entityData;
  const { assetsEndpoint } = useContext(AppContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Tile
      href={`/browse/${entity_type.toLowerCase()}/${uuid}`}
      invertColors={invertColors}
      icon={<StyledIcon component={entityIconMap[entity_type] || DatasetIcon} />}
      bodyContent={
        <Flex>
          <EntityTileBody entity_type={entity_type} id={id} invertColors={invertColors} entityData={entityData} />
          {thumbnail_file && (
            <LetterboxedThumbnail
              src={`${assetsEndpoint}/${thumbnail_file.file_uuid}/thumbnail.jpg`}
              alt={`${entity_type} ${id} thumbnail`}
              onLoad={() => setImageLoaded(true)}
              $shouldDisplayImage={imageLoaded}
            />
          )}
        </Flex>
      }
      footerContent={
        <EntityTileFooter invertColors={invertColors} entityData={entityData} descendantCounts={descendantCounts} />
      }
      tileWidth={tileWidth}
    />
  );
}

EntityTile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entityData: PropTypes.object.isRequired,
  uuid: PropTypes.string.isRequired,
  entity_type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  descendantCounts: PropTypes.shape({ Dataset: PropTypes.number, Sample: PropTypes.number }),
  invertColors: PropTypes.bool,
};

EntityTile.defaultProps = {
  descendantCounts: {},
  invertColors: false,
};

export { tileWidth };
export default EntityTile;
