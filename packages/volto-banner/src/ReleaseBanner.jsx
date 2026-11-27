import React from 'react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import { Portal } from 'react-portal';
import { Message, Container } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';

import { RELEASE_NOTES_PATH } from '@eeacms/volto-banner/constants';

import './less/stagingBanner.less';

export const RELEASE_BANNER_COOKIE = 'eea_release_banner_dismissed';
// The version decides when the banner shows again; the lifetime only
// needs to outlast a release cycle.
export const RELEASE_BANNER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const DEFAULT_MESSAGE = 'A new version of this website has been released.';

/** Release notes { release, summary } served by the Volto server. */
export const fetchReleaseNotes = async (signal) => {
  const response = await fetch(RELEASE_NOTES_PATH, {
    signal,
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data || typeof data.release !== 'string' || !data.release) return null;
  return {
    release: data.release,
    summary: typeof data.summary === 'string' ? data.summary : '',
  };
};

/**
 * Announces a new release to authenticated users.
 *
 * - Plone decides whether it may be shown: @banner sends
 *   release_banner.enabled only to authenticated users, and only when the
 *   "Release banner" switch is on (fetched by StagingBanner).
 * - The content (release + summary) comes from the release-notes agent files
 *   shipped with the frontend helm chart, served by the Volto server.
 *
 * Once closed, a cookie keeps it hidden until the next release.
 */
const ReleaseBanner = ({ banner, token }) => {
  const bannerConfig = {
    ...(config.settings.stagingBanner || {}),
    ...(banner?.config || {}),
  };
  const allowed = !!token && !!bannerConfig.release_banner?.enabled;
  const [notes, setNotes] = React.useState(null);
  const [cookies, setCookie] = useCookies([RELEASE_BANNER_COOKIE]);
  const [node, setNode] = React.useState(null);

  React.useEffect(() => {
    setNode(document.querySelector(bannerConfig.parentNodeSelector));
  }, [bannerConfig.parentNodeSelector]);

  React.useEffect(() => {
    if (!allowed) {
      setNotes(null);
      return undefined;
    }
    const controller = new AbortController();
    fetchReleaseNotes(controller.signal)
      .then((result) => setNotes(result))
      .catch(() => {
        if (!controller.signal.aborted) setNotes(null);
      });
    return () => controller.abort();
  }, [allowed]);

  const release = notes?.release;
  const dismiss = React.useCallback(() => {
    if (!release) return;
    setCookie(RELEASE_BANNER_COOKIE, release, {
      path: '/',
      maxAge: RELEASE_BANNER_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }, [release, setCookie]);

  const dismissed = !!release && cookies[RELEASE_BANNER_COOKIE] === release;

  if (!node || !allowed || !release || dismissed) return null;

  return (
    <Portal node={node}>
      <Message className="stagingBanner release-banner success" icon>
        <BodyClass className="has-banner" />
        <Container>
          <Message.Content>
            <Message.Header>{`What's new in ${release}`}</Message.Header>
            {/* Generated text: always rendered as text, never as HTML */}
            <p>{notes.summary || DEFAULT_MESSAGE}</p>
          </Message.Content>
          <div>
            {bannerConfig.bannerIcon && (
              <Icon
                name={bannerConfig.bannerIcon}
                color={bannerConfig.bannerIconColor || 'black'}
                size="32px"
              />
            )}
            {bannerConfig.bannerCloseIcon && (
              <Icon
                name={bannerConfig.bannerCloseIcon}
                color={bannerConfig.bannerCloseIconColor || 'black'}
                className="close-button"
                size="32px"
                onClick={dismiss}
              />
            )}
          </div>
        </Container>
      </Message>
    </Portal>
  );
};

export default connect((state) => ({
  banner: state.banner,
  token: state.userSession.token,
}))(ReleaseBanner);
