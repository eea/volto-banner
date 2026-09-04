import StagingBanner from './StagingBanner';
import * as addonReducers from './reducers';

import infoSVG from '@plone/volto/icons/info.svg';
import closeSVG from '@plone/volto/icons/circle-dismiss.svg';

const applyConfig = (config) => {
  const appExtras = config.settings.appExtras || [];

  config.settings.stagingBanner = {
    parentNodeSelector: '.skiplinks-wrapper',
    bannerIcon: infoSVG,
    bannerIconColor: 'black',
    bannerCloseIcon: closeSVG,
    bannerCloseIconColor: 'black',
    ...(config.settings.stagingBanner || {}),
  };

  config.settings.appExtras = [
    ...appExtras,

    {
      match: '',
      component: StagingBanner,
    },
  ];

  config.addonReducers = {
    ...config.addonReducers,
    ...addonReducers,
  };

  return config;
};

export default applyConfig;
