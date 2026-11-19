/**
 * Data Providers reducer
 * @module reducers/data_providers
 */

import { GET_BANNER_CONFIG } from '@eeacms/volto-banner/constants';

const initialState = {
  config: {},
  error: null,
  loaded: false,
  loading: false,
};

export default function banner(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_BANNER_CONFIG}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };

    case `${GET_BANNER_CONFIG}_SUCCESS`:
      return {
        ...state,
        config: {
          ...(action.result || {}),
        },
        error: null,
        loaded: true,
        loading: false,
      };

    case `${GET_BANNER_CONFIG}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };

    default:
      return state;
  }
}
