import React from 'react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import { Portal } from 'react-portal';
import { Message, Container } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';

import './less/stagingBanner.less';

export const RELEASE_BANNER_COOKIE = 'eea_release_banner_dismissed';
// The version decides when the banner shows again; the lifetime only
// needs to outlast a release cycle.
export const RELEASE_BANNER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Announces a new release to authenticated users only. Its content comes
 * from the release-notes agent files read by the backend.
 * Independent of the static / dynamic banners:
 * it has its own settings (release_banner in @banner) and, once closed,
 * stays hidden via a cookie until the release id (version) changes.
 * The @banner config is fetched by StagingBanner.
 */
const ReleaseBanner = ({ banner, token }) => {
  const bannerConfig = {
    ...(config.settings.stagingBanner || {}),
    ...(banner?.config || {}),
  };
  const releaseBanner = bannerConfig.release_banner || {};
  const [cookies, setCookie] = useCookies([RELEASE_BANNER_COOKIE]);
  const [node, setNode] = React.useState(null);

  React.useEffect(() => {
    setNode(document.querySelector(bannerConfig.parentNodeSelector));
  }, [bannerConfig.parentNodeSelector]);

  const dismiss = React.useCallback(() => {
    if (!releaseBanner.id) return;
    setCookie(RELEASE_BANNER_COOKIE, releaseBanner.id, {
      path: '/',
      maxAge: RELEASE_BANNER_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }, [releaseBanner.id, setCookie]);

  const dismissed =
    !!releaseBanner.id && cookies[RELEASE_BANNER_COOKIE] === releaseBanner.id;
  const visible = releaseBanner.enabled && !dismissed && !!token;

  if (!node || !visible) return null;

  return (
    <Portal node={node}>
      <Message className="stagingBanner release-banner success" icon>
        <BodyClass className="has-banner" />
        <Container>
          <Message.Content>
            <Message.Header>{releaseBanner.title}</Message.Header>
            {/* Generated text: always rendered as text, never as HTML */}
            <p>{releaseBanner.message}</p>
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
