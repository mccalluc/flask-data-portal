import { useState, useEffect } from 'react';
import { decodeURLParamsToConf } from 'vitessce';

export function useVitessceConfig({ vitData, setVitessceState, setVitessceErrors }) {
  const [vitessceSelection, setVitessceSelection] = useState(null);
  const [vitessceConfig, setVitessceConfig] = useState(null);

  useEffect(() => {
    function setVitessceDefaults(vData) {
      setVitessceState(vData.length === 1 ? vData[0] : vData);
      setVitessceSelection(0);
      setVitessceConfig(vData);
    }

    if (setVitessceState && vitData) {
      const fragment = window.location.hash.substr(1);
      if (!fragment.startsWith('vitessce_conf_')) {
        // This is an anchor link like "#attribution", rather than a saved vitessce link.
        setVitessceDefaults(vitData);
        return;
      }
      let vitessceURLConf;
      try {
        vitessceURLConf = fragment.length > 0 ? decodeURLParamsToConf(fragment) : null;
      } catch (err) {
        // If URL cannot be parsed, display error and show Vitessce.
        setVitessceErrors(['View configuration from URL was not able to be parsed because it was likely truncated.']);
        setVitessceDefaults(vitData);
        return;
      }
      let initializedVitDataFromUrl = vitData;
      let initialSelectionFromUrl;
      // If these is a url conf and the we have a multidataset, use the url conf to find the initial selection of the multi-dataset.
      if (vitData.length > 1) {
        initialSelectionFromUrl = Math.max(0, vitData.map(({ name }) => name).indexOf(vitessceURLConf?.name));
        initializedVitDataFromUrl[initialSelectionFromUrl] = vitessceURLConf || vitData[initialSelectionFromUrl];
      } else {
        initializedVitDataFromUrl = vitessceURLConf || vitData[0];
      }
      setVitessceState(initializedVitDataFromUrl[initialSelectionFromUrl]);
      setVitessceSelection(initialSelectionFromUrl);
      setVitessceConfig(initializedVitDataFromUrl);
    }
  }, [setVitessceState, vitData, setVitessceErrors]);
  return { vitessceConfig, vitessceSelection, setVitessceSelection };
}
