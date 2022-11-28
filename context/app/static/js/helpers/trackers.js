import MatomoTracker from '@datapunt/matomo-tracker-js';
import ReactGA from 'react-ga';
import { readCookie } from 'js/helpers/functions';

function getSiteIds(location) {
  const { host } = location;

  // siteIds should correspond to the list at:
  // https://hubmap.matomo.cloud/index.php?module=SitesManager

  switch (host) {
    case 'portal.hubmapconsortium.org':
      return [1, 4]; // TODO: Remove "1" when we can confirm successful GA migration.
    case 'localhost:5001':
      return [2];
    default:
      return [3];
  }
}

function getUserType() {
  // Set in routes_auth.py:
  return readCookie('last_login') ? 'internal' : 'external';
}

// eslint-disable-next-line no-restricted-globals
const trackers = getSiteIds(location).map(
  (id) =>
    new MatomoTracker({
      urlBase: 'https://hubmap.matomo.cloud/',
      siteId: id,
      // userId: 'UID76903202', // optional, default value: `undefined`.
      // trackerUrl: 'https://hubmap.matomo.cloud/tracking.php', // optional, default value: `${urlBase}matomo.php`
      // srcUrl: 'https://hubmap.matomo.cloud/tracking.js', // optional, default value: `${urlBase}matomo.js`
      disabled: process.env.NODE_ENV === 'test', // Tracking calls should be no-ops during tests.
      // heartBeat: { // optional, enabled by default
      //   active: true, // optional, default value: true
      //   seconds: 10 // optional, default value: `15
      // },
      // linkTracking: false, // optional, default value: true
      // configurations: { // optional, default value: {}
      //   // any valid matomo configuration, all below are optional
      //   disableCookies: true,
      //   setSecureCookie: true,
      //   setRequestMethod: 'POST'
      // }
      configurations: { setCustomDimension: [1 /* user_type */, getUserType()] },
    }),
);

ReactGA.initialize('UA-133341631-3', { testMode: process.env.NODE_ENV === 'test' });

function trackPageView(path) {
  trackers.forEach((tracker) => {
    tracker.trackPageView({ href: path });
  });
  ReactGA.pageview(path);
}

function trackEvent(event) {
  trackers.forEach((tracker) => {
    tracker.trackEvent(event);
  });
  ReactGA.event(event);
}

function trackLink(href, type) {
  trackers.forEach((tracker) => {
    tracker.trackLink({
      href,
      linkType: type || 'link',
    });
  });
  ReactGA.event({
    category: type || 'Outbound Link',
    action: 'Clicked',
    label: href,
    nonInteraction: false,
  });
}

function trackSiteSearch(keyword) {
  trackers.forEach((tracker) => {
    tracker.trackSiteSearch({
      keyword,
    });
  });
  /*
  We currently call both trackEvent and trackSiteSearch:
  while that is the case, we don't have to double track the even in GA.
  
  ReactGA.event({
    // category: analyticsCategory,
    action: 'Free Text Search',
    label: keyword,
  });
  */
}

export { trackPageView, trackEvent, trackLink, trackSiteSearch };
