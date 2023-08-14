import create from 'zustand';

export type FileDisplayOption = 'all' | 'qa/qc' | 'data products';

export type FilesStore = {
  filesToDisplay: FileDisplayOption;
  toggleDisplayOnlyQaQc: () => void;
  toggleDisplayOnlyDataProducts: () => void;
};

const useFilesStore = create<FilesStore>((set) => ({
  filesToDisplay: 'all',
  toggleDisplayOnlyQaQc: () =>
    set((state) => ({
      filesToDisplay: state.filesToDisplay === 'all' ? 'qa/qc' : 'all',
    })),
  toggleDisplayOnlyDataProducts: () =>
    set((state) => ({
      filesToDisplay: state.filesToDisplay === 'all' ? 'data products' : 'all',
    })),
}));

export default useFilesStore;
