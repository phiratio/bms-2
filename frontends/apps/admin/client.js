/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import deepForceUpdate from 'react-deep-force-update';
import queryString from 'query-string';
import { createPath } from 'history';
import { addLocaleData } from 'react-intl';
import OfflinePluginRuntime from 'offline-plugin/runtime';
import { hideLoading, showLoading } from 'react-redux-loading-bar';
import cookies from 'browser-cookies';
import jwt from 'jsonwebtoken';
import { actions as notifActions } from 'redux-notification-center';
// This is so bad: requiring all locale if they are not needed?
/* @intl-code-template import ${lang} from 'react-intl/locale-data/${lang}'; */
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
/* @intl-code-template-end */
import App from './App';
import createFetch from '../../core/createFetch';
import configureStore from '../../store/configureStore';
import { updateMeta } from './DOMUtils';
import history from '../../history';
import createApolloClient from '../../core/createApolloClient';
import router from './router';
import { getIntl } from '../../actions/intl';
import HttpClient from '../../core/httpClient';
import get from 'lodash.get';
import { setUser, unsetUser } from '../../actions/user';
import BackendApi from '../../core/BackendApi';
import { getDecodedToken, getToken } from '../../core/AuthApi';

const backendApi = new BackendApi();
const { notifSend } = notifActions;

const isTv =
  typeof navigator !== 'undefined' &&
  (navigator.userAgent.match(/FireTV/) || navigator.userAgent.match(/Silk/));
if (process.env.NODE_ENV === 'production' && !isTv)
  OfflinePluginRuntime.install({
    onUpdateReady: () => {
      // Tells to new SW to take control immediately
      console.log('SW: Update Ready');
      OfflinePluginRuntime.applyUpdate();
    },
    onUpdated: () => {
      console.log('SW: Updated');
      window.swUpdate = true;
    },
  });

// OfflinePluginRuntime.install({
//   onUpdating: () => undefined,
//   // When an update is ready we will tell the new SW to take control immediately.
//   onUpdateReady: () => OfflinePluginRuntime.applyUpdate(),
//   // After the new SW update has been applied we will reload the users page
//   // to ensure they are using the latest assets.
//   // This only gets run if there were updates available for our cached assets.
//   onUpdated: () => window.location.reload(),
//   onUpdateFailed: () => undefined,
// });

/* @intl-code-template addLocaleData(${lang}); */
addLocaleData(en);
addLocaleData(ru);
/* @intl-code-template-end */

// Universal HTTP client
const fetch = createFetch(window.fetch, {
  baseUrl: window.App.apiUrl,
});

const apolloClient = createApolloClient();
// Initialize a new Redux store
// http://redux.js.org/docs/basics/UsageWithReact.html
window.App.state.user = getDecodedToken();

const store = configureStore(window.App.state, {
  apolloClient,
  fetch,
  history,
});
const translate = (item, value) =>
  typeof item === 'object'
    ? store.dispatch(getIntl()).formatMessage(item, value)
    : store
        .dispatch(getIntl())
        .formatMessage({ id: item, defaultMessage: item }, value);
const showNotification = (msg, kind = 'success', dismissAfter = 10000) => {
  const translatedMessage = translate(msg);
  return store.dispatch(
    notifSend({
      message: <React.Fragment>{translatedMessage}</React.Fragment>,
      kind,
      dismissAfter,
    }),
  );
};

const httpClient = new HttpClient(
  store,
  fetch,
  store.dispatch(getIntl()),
  showNotification,
);
const focus = (id) =>
  setTimeout(() => {
    if (document.getElementById(id)) document.getElementById(id).focus();
  }, 300); // Very nasty hack, otherwise Chrome does not focus inputs after they been re-rendered

const socket = httpClient.openSocket({
  autoConnect: false,
});
// Global (context) variables that can be easily accessed from any React component
// https://facebook.github.io/react/docs/context.html
const context = {
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: (...styles) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map((x) => x._insertCss());
    return () => {
      removeCss.forEach((f) => f());
    };
  },
  // For react-apollo
  client: apolloClient,
  store,
  storeSubscription: null,
  // Universal HTTP client
  fetch,
  // intl instance as it can be get with injectIntl
  intl: store.dispatch(getIntl()),
  httpClient,
  // ...(process.env.BROWSER && { socket: httpClient.openSocket() }),
  translate,
  showNotification,
  focus,
  socket,
};

const container = document.getElementById('app');
let currentLocation = history.location;
let appInstance;

const scrollPositionsHistory = {};

// Re-render the app when window.location changes
async function onLocationChange(location, action) {
  if (!get(store.getState(), 'user.role') && getToken()) {
    const token = getToken();
    const backendApi = new BackendApi(token);
    await backendApi
      .get('/accounts/profile/')
      .then((res) => {
        store.dispatch(setUser({ ...store.getState().user, ...res.data }));
      })
      .catch((e) => {
        console.error('Unable to get user profile', e.message);
        if (e.statusCode === 401) {
          history.replace('/logout');
        }
      });
  }
  // Remember the latest scroll position for the previous location
  scrollPositionsHistory[currentLocation.key] = {
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset,
  };
  // Delete stored scroll position for next page if any
  if (action === 'PUSH') {
    delete scrollPositionsHistory[location.key];
  }
  currentLocation = location;

  context.intl = store.dispatch(getIntl());

  const isInitialRender = !action;
  try {
    context.pathname = location.pathname;
    context.query = queryString.parse(location.search);
    context.locale = store.getState().intl.locale;

    // Traverses the list of routes in the order they are defined until
    // it finds the first route that matches provided URL path string
    // and whose action method returns anything other than `undefined`.
    const route = await router.resolve(context);
    // Prevent multiple page renders during the routing process
    if (currentLocation.key !== location.key) {
      return;
    }

    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }

    const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
    appInstance = renderReactApp(
      <App context={context}>{route.component}</App>,
      container,
      () => {
        if (isInitialRender) {
          // Switch off the native scroll restoration behavior and handle it manually
          // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
          if (window.history && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
          }

          const elem = document.getElementById('css');
          if (elem) elem.parentNode.removeChild(elem);
          return;
        }

        store.dispatch(hideLoading()); // Hide  loading bar if any exists
        store.dispatch(showLoading()); // Show loading bar

        document.title = route.title;

        updateMeta('description', route.description);
        // Update necessary tags in <head> at runtime here, ie:
        // updateMeta('keywords', route.keywords);
        // updateCustomMeta('og:url', route.canonicalUrl);
        // updateCustomMeta('og:image', route.imageUrl);
        // updateLink('canonical', route.canonicalUrl);
        // etc.

        let scrollX = 0;
        let scrollY = 0;
        const pos = scrollPositionsHistory[location.key];
        if (pos) {
          scrollX = pos.scrollX;
          scrollY = pos.scrollY;
        } else {
          const targetHash = location.hash.substr(1);
          if (targetHash) {
            const target = document.getElementById(targetHash);
            if (target) {
              scrollY = window.pageYOffset + target.getBoundingClientRect().top;
            }
          }
        }

        // Restore the scroll position if it was saved into the state
        // or scroll to the given #hash anchor
        // or scroll to top of the page
        window.scrollTo(scrollX, scrollY);

        // Google Analytics tracking. Don't send 'pageview' event after
        // the initial rendering, as it was already sent
        if (window.ga) {
          window.ga('send', 'pageview', createPath(location));
        }

        store.dispatch(hideLoading()); // Hide loading bar
      },
    );
  } catch (error) {
    if (__DEV__) {
      throw error;
    }

    console.error(error);

    // Do a full page reload if error occurs during client-side navigation
    if (!isInitialRender && currentLocation.key === location.key) {
      console.error('RSK will reload your page after error');
      window.location.reload();
    }
  }
}

let isHistoryObserved = false;
export default function main() {
  // Handle client-side navigation by using HTML5 History API
  // For more information visit https://github.com/mjackson/history#readme
  currentLocation = history.location;
  if (!isHistoryObserved) {
    isHistoryObserved = true;
    history.listen(onLocationChange);
  }
  onLocationChange(currentLocation);
}

// globally accesible entry point
window.RSK_ENTRY = main;

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('./router', () => {
    if (appInstance && appInstance.updater.isMounted(appInstance)) {
      // Force-update the whole tree, including components that refuse to update
      deepForceUpdate(appInstance);
    }

    onLocationChange(currentLocation);
  });
}
