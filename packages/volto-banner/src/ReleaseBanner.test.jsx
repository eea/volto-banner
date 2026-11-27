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

const makeStore = (token, enabled = true) =>
  mockStore({
    banner: {
      config: {
        release_banner: { enabled },
        parentNodeSelector: '#releaseId',
        bannerIcon: infoSVG,
        bannerCloseIcon: closeSVG,
      },
    },
    userSession: { token },
  });

const mockNotes = (body, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok, json: () => Promise.resolve(body) }),
  );
};

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

const flush = () =>
  waitFor(() => {
    expect(document.getElementById('releaseId')).toBeInTheDocument();
  });

describe('ReleaseBanner', () => {
  beforeEach(() => {
    document.cookie = `${RELEASE_BANNER_COOKIE}=; path=/; max-age=0`;
    document.getElementById('releaseId')?.remove();
    const parentNode = document.createElement('div');
    parentNode.setAttribute('id', 'releaseId');
    document.body.appendChild(parentNode);
    mockNotes({ release: 'v2.6.0', summary: 'Faster search.' });
  });

  it('shows the release notes from the Volto server when Plone allows it', async () => {
    const { getByText } = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(getByText("What's new in v2.6.0")).toBeInTheDocument();
      expect(getByText('Faster search.')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/@@release-notes',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
  });

  it('does not even ask for the notes for anonymous users', async () => {
    const { queryByText } = renderBanner(makeStore(null));
    await flush();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(queryByText("What's new in v2.6.0")).not.toBeInTheDocument();
  });

  it('is hidden when Plone does not enable it', async () => {
    const { queryByText } = renderBanner(makeStore('token', false));
    await flush();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(queryByText("What's new in v2.6.0")).not.toBeInTheDocument();
  });

  it('is hidden when the server has no release notes', async () => {
    mockNotes({}, false);
    const { queryByText } = renderBanner(makeStore('token'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(queryByText(/What's new/)).not.toBeInTheDocument();
  });

  it('ignores a malformed response', async () => {
    mockNotes({ release: 42, summary: 'x' });
    const { queryByText } = renderBanner(makeStore('token'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(queryByText(/What's new/)).not.toBeInTheDocument();
  });

  it('uses a default message when the summary is empty', async () => {
    mockNotes({ release: 'v2.6.0', summary: '' });
    const { getByText } = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(
        getByText('A new version of this website has been released.'),
      ).toBeInTheDocument();
    });
  });

  it('renders the summary as text, not HTML', async () => {
    mockNotes({
      release: 'v2.6.0',
      summary: '<img src="x" onerror="window.__xss = 1"> Faster search',
    });
    const { getByText } = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(
        getByText('<img src="x" onerror="window.__xss = 1"> Faster search'),
      ).toBeInTheDocument();
    });
    expect(document.querySelector('.release-banner img')).toBeNull();
    expect(window.__xss).toBeUndefined();
  });

  it('stays hidden after close for the same release', async () => {
    const { getByText, queryByText, unmount } = renderBanner(
      makeStore('token'),
    );
    await waitFor(() => {
      expect(getByText("What's new in v2.6.0")).toBeInTheDocument();
    });
    fireEvent.click(document.querySelector('.release-banner .close-button'));
    await waitFor(() => {
      expect(queryByText("What's new in v2.6.0")).not.toBeInTheDocument();
    });
    expect(document.cookie).toContain(`${RELEASE_BANNER_COOKIE}=v2.6.0`);
    unmount();

    const again = renderBanner(makeStore('token'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await flush();
    expect(again.queryByText("What's new in v2.6.0")).not.toBeInTheDocument();
  });

  it('shows again for a new release', async () => {
    document.cookie = `${RELEASE_BANNER_COOKIE}=v2.6.0; path=/`;
    mockNotes({ release: 'v2.7.0', summary: 'New map viewer.' });
    const { getByText } = renderBanner(makeStore('token'));
    await waitFor(() => {
      expect(getByText("What's new in v2.7.0")).toBeInTheDocument();
    });
  });
});
