import { entityIconMap } from 'js/shared-styles/icons/entityIconMap';
import { SearchIcon } from 'js/shared-styles/icons';
import { TimelineData } from 'js/shared-styles/Timeline/types';
import ContactUsLink from 'js/shared-styles/Links/ContactUsLink';
import React from 'react';

export const HOME_TIMELINE_ITEMS: TimelineData[] = [
  {
    title: 'Molecular & Cellular Query Updated',
    titleHref: '/cells',
    description: 'Search datasets by cell type name or Cell Ontology ID.',
    date: 'May 2024',
    img: <entityIconMap.CellType />,
  },
  {
    title: 'Multi-Assay Datasets now available',
    titleHref: '/search?entity_type[0]=Dataset', // TODO: update this to the correct link
    description: 'Visualize and download data from multi-assay datasets of 10x Multiome and Visium (no probes).',
    date: 'May 2024',
    img: <entityIconMap.Dataset fontSize="1.5rem" />,
  },
  {
    title: 'Dataset Search reorganized',
    titleHref: '/search?entity_type[0]=Dataset',
    description:
      'Added visualization, dataset category and pipeline filters to dataset search page. Dataset assay filter is now hierarchical to improve grouping of similar experiments.',
    date: 'March 2024',
    img: <SearchIcon />,
  },
  {
    title: 'Workspace Beta announced',
    titleHref: '/workspaces',
    description: (
      <>
        Beta group has been opened to a larger group of beta testers. You must be a registered workspace beta tester to
        use this feature. <ContactUsLink capitalize /> if interested.
      </>
    ),
    img: <entityIconMap.Workspace />,
    date: 'December 2023',
  },
  {
    title: 'Biomarkers Beta released',
    titleHref: '/biomarkers',
    description:
      'Beta of biomarkers page is now available to all public users. Gene information is currently available, and protein information is in development.',
    date: 'December 2023',
    img: <entityIconMap.Gene />,
  },
];
