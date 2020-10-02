import create from 'zustand';

const useEntityStore = create((set) => ({
  summaryInView: false,
  setSummaryInView: (val) => set({ summaryInView: val }),
  vizIsFullscreen: false,
  setVizIsFullscreen: (val) => set({ vizIsFullscreen: val }),
  assayMetadata: {},
  setAssayMetadata: (val) => set({ assayMetadata: val }),
  vitessceConfig: {},
  setVitessceConfig: (val) => set({ vitessceConfig: val }),
}));

export default useEntityStore;
