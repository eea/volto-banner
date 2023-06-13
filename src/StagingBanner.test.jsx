import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, waitFor } from '@testing-library/react';
import StagingBanner from './StagingBanner';
import { getBannerConfig } from '@eeacms/volto-banner/actions';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore([]);

jest.mock('@eeacms/volto-banner/actions', () => ({
  getBannerConfig: jest.fn(),
}));

describe('StagingBanner', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      banner: {
        config: {
          static_banner: {
            enabled: true,
            visible_to_all: true,
            title: 'Test Title',
            message: 'Test Message',
          },
          dynamic_banner: {
            enabled: true,
            visible_to_all: true,
            title: 'Dynamic Title',
            message: 'Dynamic Message',
            rancher_stacks_status: 'Dynamic Banner Status',
          },
          parentNodeSelector: '#testId',
          bannerIcon: 'testIcon',
          bannerCloseIcon: 'testCloseIcon',
        },
      },
      actions: {
        actions: {
          object: {},
        },
      },
      userSession: {
        token: null,
      },
    });

    store.dispatch = jest.fn();
  });

  it('dispatches getBannerConfig action on mount and does not display the banners', () => {
    const store = mockStore({
      banner: {
        config: {
          static_banner: {
            enabled: false,
            visible_to_all: true,
            title: 'Test Title',
            message: 'Test Message',
          },
          dynamic_banner: {
            enabled: false,
            visible_to_all: true,
            title: 'Dynamic Title',
            message: undefined,
            rancher_stacks_status: 'Dynamic Banner Status',
          },
          parentNodeSelector: '#testId',
          bannerIcon: 'testIcon',
          bannerCloseIcon: 'testCloseIcon',
        },
      },
      actions: {
        actions: {
          object: {},
        },
      },
      userSession: {
        token: null,
      },
    });

    store.dispatch = jest.fn();
    render(
      <Provider store={store}>
        <StagingBanner />
      </Provider>,
    );

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(getBannerConfig());
  });

  it('renders static and dynamic banners when enabled', async () => {
    const parentNode = document.createElement('div');
    parentNode.setAttribute('id', 'testId');
    document.body.appendChild(parentNode);

    const { getByText } = render(
      <Provider store={store}>
        <StagingBanner />
      </Provider>,
    );

    await waitFor(() => {
      expect(getByText('Test Title')).toBeInTheDocument();
      expect(getByText('Test Message')).toBeInTheDocument();
      expect(getByText('Dynamic Title')).toBeInTheDocument();
      expect(getByText('Dynamic Message')).toBeInTheDocument();
    });
  });

  it('dispatches getBannerConfig action on mount', () => {
    const store = mockStore({
      banner: {
        config: undefined,
      },
      actions: {
        actions: {
          object: {},
        },
      },
      userSession: {
        token: null,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <StagingBanner />
      </Provider>,
    );

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(getBannerConfig());
  });
});
