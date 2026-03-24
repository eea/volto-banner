import React from 'react';
import { connect } from 'react-redux';
import { Portal } from 'react-portal';
import cx from 'classnames';
import { Message, Container } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { Icon } from '@plone/volto/components';
import { BodyClass } from '@plone/volto/helpers';

import { getBannerConfig } from '@eeacms/volto-banner/actions';

import './less/stagingBanner.less';

const types = {
  upgrading: 'warning',
  upgraded: 'warning',
  degraded: 'error',
  stopped: 'error',
  error: 'error',
  inactive: 'error',
};

const bannerIsVisible = (token, enabled, visible_to_all) => {
  return enabled && (token || visible_to_all);
};

const StagingBanner = ({ banner, token, dispatch }) => {
  const bannerConfig = {
    ...(config.settings.stagingBanner || {}),
    ...(banner.config || {}),
  };
  const staticBanner = bannerConfig.static_banner || {};
  const dynamicBanner = bannerConfig.dynamic_banner || {};

  React.useEffect(() => {
    dispatch(getBannerConfig());
    /* eslint-disable-next-line */
  }, []);

  const [node, setNode] = React.useState(''),
    [staticBannerVisible, setStaticBannerVisible] = React.useState(true),
    [dynamicBannerVisible, setDynamicBannerVisible] = React.useState(true),
    hideStaticBanner = React.useCallback(() => {
      setStaticBannerVisible(false);
    }, [setStaticBannerVisible]),
    hideDynamicBanner = React.useCallback(() => {
      setDynamicBannerVisible(false);
    }, [setDynamicBannerVisible]);

  React.useEffect(() => {
    setNode(document.querySelector(bannerConfig.parentNodeSelector));
  }, [bannerConfig.parentNodeSelector]);

  React.useEffect(() => {
    if (!node || !document?.body) {
      return undefined;
    }

    const updateBannerOffset = () => {
      const visibleBanners = Array.from(
        node.querySelectorAll('.stagingBanner'),
      );
      const offset = visibleBanners.reduce(
        (total, bannerNode) =>
          total + bannerNode.getBoundingClientRect().height,
        0,
      );

      if (offset > 0) {
        document.body.style.setProperty(
          '--staging-banner-offset',
          `${offset}px`,
        );
      } else {
        document.body.style.removeProperty('--staging-banner-offset');
      }
    };

    updateBannerOffset();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateBannerOffset);

      return () => {
        window.removeEventListener('resize', updateBannerOffset);
        document.body.style.removeProperty('--staging-banner-offset');
      };
    }

    const observer = new ResizeObserver(updateBannerOffset);

    Array.from(node.querySelectorAll('.stagingBanner')).forEach(
      (bannerNode) => {
        observer.observe(bannerNode);
      },
    );

    return () => {
      observer.disconnect();
      document.body.style.removeProperty('--staging-banner-offset');
    };
  }, [node, token, staticBannerVisible, dynamicBannerVisible, banner.config]);

  if (!node) return '';

  return (
    <Portal node={node}>
      {bannerIsVisible(
        token,
        staticBannerVisible && staticBanner.enabled,
        staticBanner.visible_to_all,
      ) && (
        <Message
          className={cx('stagingBanner static-banner', staticBanner.type)}
          icon
        >
          <BodyClass className="has-banner" />
          <Container>
            <Message.Content>
              <Message.Header>{staticBanner.title}</Message.Header>
              <p
                dangerouslySetInnerHTML={{
                  __html: staticBanner.message,
                }}
              />
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
                  onClick={hideStaticBanner}
                />
              )}
            </div>
          </Container>
        </Message>
      )}
      {bannerIsVisible(
        token,
        dynamicBannerVisible && dynamicBanner.enabled,
        dynamicBanner.visible_to_all,
      ) &&
        dynamicBanner.rancher_stacks_status && (
          <Message
            className={cx(
              'stagingBanner static-banner',
              types[dynamicBanner.rancher_stacks_status],
            )}
            icon
          >
            <BodyClass className="has-banner" />
            <Container>
              <Message.Content>
                <Message.Header>{dynamicBanner.title}</Message.Header>
                <p
                  dangerouslySetInnerHTML={{
                    __html: (dynamicBanner.message || '').replace(
                      '{}',
                      dynamicBanner.rancher_stacks_status,
                    ),
                  }}
                />
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
                    onClick={hideDynamicBanner}
                  />
                )}
              </div>
            </Container>
          </Message>
        )}
    </Portal>
  );
};

export default connect((state) => ({
  banner: state.banner,
  objectActions: state.actions.actions.object,
  token: state.userSession.token,
}))(StagingBanner);
