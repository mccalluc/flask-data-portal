import React from 'react';

import { getAuthHeader } from 'js/helpers/functions';

function useVitessceConfig(uuid, groupsToken) {
  const [vitessceConfig, setVitessceConfig] = React.useState(undefined);

  React.useEffect(() => {
    async function getAndSetVitessceConfig() {
      const headers = getAuthHeader(groupsToken);

      const response = await fetch(`/browse/dataset/${uuid}.vitessce.json`, { headers });

      if (!response.ok) {
        console.error('Vitessce API failed', response);
        // setIsLoading(false);
        return;
      }
      const responseVitessceConfig = await response.json();
      setVitessceConfig(responseVitessceConfig);
      // setIsLoading(false);
    }
    getAndSetVitessceConfig();
  }, [uuid, groupsToken]);

  return vitessceConfig /* , isLoading */;
}

export default useVitessceConfig;
