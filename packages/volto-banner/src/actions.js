import qs from 'query-string';
import { GET_BANNER_CONFIG } from './constants';

export function getBannerConfig() {
  const query = qs.stringify({
    ...(__DEVELOPMENT__ ? { development: true } : {}),
  });

  return {
    type: GET_BANNER_CONFIG,
    request: {
      op: 'get',
      path: '/@banner' + (query ? `?${query}` : ''),
    },
  };
}
