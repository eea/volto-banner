import { vi } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import configureStore from 'redux-mock-store';
import { render, waitFor, fireEvent } from '@testing-library/react';
import ReleaseBanner, { RELEASE_BANNER_COOKIE } from './ReleaseBanner';
import infoSVG from '@plone/volto/icons/info.svg';
import closeSVG from '@plone/volto/icons/circle-dismiss.svg';
import '@testing-library/jest-dom';

const mockStore = configureStore([]);

const makeStore = (token, release = {}) =>
  mockStore({
    banner: {
      config: {
        release_banner: {
          enabled: true,
          visible_to_all: false,
          id: '2.3.0',
          title: 'Release Title',
          message: 'Release Message',
          dismiss_days: 90,
          ...release,
        },
        parentNodeSelector: '#releaseId',
        bannerIcon: infoSVG,
        bannerCloseIcon: closeSVG,
      },
    },
    userSession: { token },
  });

const renderBanner = (store) => {
  store.dispatch = vi.fn();
  return render(
    <CookiesProvider>
      <Provider store={store}>
        <ReleaseBanner />
      </Provider>
    </CookiesProvider>,
  );
};

describe('ReleaseBanner', () => {
  beforeEach(() => {
    document.cookie = `${RELEASE_BANNER_COOKIE}=; path=/; max-age=0`;
    document.getElementById('releaseId')?.remove();
    const parentNode = document.createElement('div');
    parentNode.setAttribute('id', 'releaseId');
    document.body.appendChild(parentNode);
  });

  it('shows to authenticated users', async () => {
    const { getByText } = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(getByText('Release Title')).toBeInTheDocument();
      expect(getByText('Release Message')).toBeInTheDocument();
    });
  });

  it('is hidden for anonymous users unless visible_to_all', async () => {
    const { queryByText, unmount } = renderBanner(makeStore(null));
    await waitFor(() => {
      expect(document.getElementById('releaseId')).toBeInTheDocument();
    });
    expect(queryByText('Release Title')).not.toBeInTheDocument();
    unmount();

    const { getByText } = renderBanner(
      makeStore(null, { visible_to_all: true }),
    );
    await waitFor(() => {
      expect(getByText('Release Title')).toBeInTheDocument();
    });
  });

  it('is hidden when disabled', async () => {
    const { queryByText } = renderBanner(
      makeStore('token', { enabled: false }),
    );
    await waitFor(() => {
      expect(document.getElementById('releaseId')).toBeInTheDocument();
    });
    expect(queryByText('Release Title')).not.toBeInTheDocument();
  });

  it('stays hidden after close for the same release id', async () => {
    const { getByText, queryByText, unmount } = renderBanner(
      makeStore('token'),
    );
    await waitFor(() => {
      expect(getByText('Release Title')).toBeInTheDocument();
    });
    fireEvent.click(document.querySelector('.release-banner .close-button'));

    await waitFor(() => {
      expect(queryByText('Release Title')).not.toBeInTheDocument();
    });
    expect(document.cookie).toContain(`${RELEASE_BANNER_COOKIE}=2.3.0`);
    unmount();

    const again = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(document.getElementById('releaseId')).toBeInTheDocument();
    });
    expect(again.queryByText('Release Title')).not.toBeInTheDocument();
  });

  it('shows again when the release id changes', async () => {
    document.cookie = `${RELEASE_BANNER_COOKIE}=2.3.0; path=/`;
    const { getByText } = renderBanner(makeStore('token', { id: '2.4.0' }));
    await waitFor(() => {
      expect(getByText('Release Title')).toBeInTheDocument();
    });
  });
});
