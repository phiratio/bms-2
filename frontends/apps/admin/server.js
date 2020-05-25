/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import path from 'path';
import Promise from 'bluebird';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { graphql } from 'graphql';
import expressGraphQL from 'express-graphql';
import nodeFetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { getDataFromTree } from 'react-apollo';
import PrettyError from 'pretty-error';
import { IntlProvider } from 'react-intl';
import pathToRegexp from 'path-to-regexp';
import { actions as notifActions } from 'redux-notification-center';

import './serverIntlPolyfill';
import createApolloClient from '../../core/createApolloClient';
import App from './App';
import Html from './Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import { AccessDeniedPageWithoutStyle } from './routes/access-denied/AccessDeniedPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import accessDeniedPageStyle from './routes/access-denied/AccessDeniedPage.css';
import createFetch from '../../core/createFetch';
import router from './router';
import schema from '../../data/schema';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import configureStore from '../../store/configureStore';
import { setRuntimeVariable } from '../../actions/runtime';
import { setLocale } from '../../actions/intl';
import config from './config';
import HttpClient from '../../core/httpClient';

const { notifSend } = notifActions;

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';
// TODO: Add brute force protection

const app = express();

// Disable X-Powered-By header
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});
//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);
//
// Register Node.js middlewarer
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'public/splashscreens')));
app.use(cookieParser());
app.use(
  requestLanguage({
    languages: config.locales,
    queryName: 'lang',
    cookie: {
      name: 'lang',
      options: {
        path: '/',
        maxAge: 3650 * 24 * 3600 * 1000, // 10 years in miliseconds
      },
      url: '/lang/{language}',
    },
  }),
);

//
// Authentication
// -----------------------------------------------------------------------------
// app.use(
//   expressJwt({
//     secret: config.auth.jwt.secret,
//     credentialsRequired: true,
//     getToken: req =>
//       req.cookies[config.auth.tokenId] || req.query[config.auth.tokenId],
//   }).unless({
//     path: [
//       '/',
//       '/login',
//       '/logout',
//       '/signup',
//       '/forgot',
//       '/access-denied',
//       '/site.webmanifest',
//       '/sw.js',
//       // '/accounts?__uncache=app-cache',
//       pathToRegexp('/verify/:token'),
//       pathToRegexp('/forgot/:token'),
//       pathToRegexp('/reset/:token'),
//       pathToRegexp('/auth/(.*)'),
//       pathToRegexp('/(.*)'),
//     ],
//   }),
// );

app.use(async (req, res, next) => {
  const token = req.query[config.auth.tokenId];
  if (token) {
    try {
      const decoded = await jwt.verify(token, config.auth.jwt.secret);
      if (decoded) {
        res.cookie(config.auth.tokenId, token);
      }
    } catch (e) {
      next(e);
    }
  }
  next();
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // if request contains json header then respond with json
    if (
      req.headers['content-type'] === 'application/json' ||
      req.headers['content-type'] === 'application/x-www-form-urlencoded'
    ) {
      return res.status(401).send({ success: false, errors: err.message });
    }
    // Otherwise redirect to login page
    // return res.status(301).redirect('/login');

    const locale = req.language;
    const html = ReactDOM.renderToStaticMarkup(
      <Html
        title="Access Denied"
        styles={[{ id: 'css', cssText: accessDeniedPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
        app={{ lang: locale }}
      >
        {ReactDOM.renderToString(
          <IntlProvider locale={locale}>
            <AccessDeniedPageWithoutStyle />
          </IntlProvider>,
        )}
      </Html>,
    );
    return res.status(403).send(`<!doctype html>${html}`);
  }
  next();
});

// Error handler for express-jwt
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie(config.auth.tokenId);
  }
  next(err);
});

if (__DEV__) {
  app.enable('trust proxy');
}

app.get('/site.webmanifest', (req, res) =>
  res.status(200).json({
    version: config.version,
    short_name: config.pwa.shortTitle,
    name: config.pwa.title,
    icons: [
      {
        src: `${config.staticFilesUrl}/pwa/icon.png`,
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    start_url: config.pwa.startUrl,
    background_color: config.pwa.backgroundColor,
    display: config.pwa.display,
    theme_color: config.pwa.themeColor,
  }),
);
//
// Register API middleware
// -----------------------------------------------------------------------------
// https://github.com/graphql/express-graphql#options
const graphqlMiddleware = expressGraphQL(req => ({
  schema,
  graphiql: __DEV__,
  rootValue: { request: req },
  pretty: __DEV__,
}));
app.use('/graphql', graphqlMiddleware);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    const apolloClient = createApolloClient({
      schema,
      rootValue: { request: req },
    });

    // Universal HTTP client
    const fetch = createFetch(nodeFetch, {
      baseUrl: config.api.clientUrl,
      cookie: req.headers.cookie,
      apolloClient,
      schema,
      graphql,
    });

    let user = null;
    const tokenIdCookie = req.cookies[config.auth.tokenId];

    if (tokenIdCookie && !req.user) {
      try {
        const decoded = await jwt.verify(tokenIdCookie, config.auth.jwt.secret);
        if (decoded) user = decoded;
      } catch (e) {}
    }

    const initialState = {
      user: req.user || user,
      breadcrumbs: [],
    };

    const store = configureStore(initialState, {
      cookie: req.headers.cookie,
      apolloClient,
      fetch,
      // I should not use `history` on server.. but how I do redirection? follow universal-router
      history: null,
    });

    store.dispatch(
      setRuntimeVariable({
        name: 'initialNow',
        value: Date.now(),
      }),
    );

    store.dispatch(
      setRuntimeVariable({
        name: 'availableLocales',
        value: config.locales,
      }),
    );

    const locale = req.language;
    const intl = await store.dispatch(
      setLocale({
        locale,
      }),
    );
    const translate = (item, value) =>
      typeof item === 'object'
        ? intl.formatMessage(item, value)
        : intl.formatMessage({ id: item, defaultMessage: item }, value);
    const showNotification = (msg, kind = 'success') => {
      const translatedMessage = translate(msg);
      return store.dispatch(
        notifSend({
          message: <React.Fragment>{translatedMessage}</React.Fragment>,
          kind,
          dismissAfter: 10000,
        }),
      );
    };
    const httpClient = new HttpClient(store, fetch, intl, showNotification);
    const focus = id =>
      setTimeout(() => {
        document.getElementById(id).focus();
      }, 300); // Very nasty hack, otherwise Chrome does not focus inputs after they've been re-rendered
    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      insertCss,
      fetch,
      // The twins below are wild, be careful!
      pathname: req.path,
      query: req.query,
      // You can access redux through react-redux connect
      store,
      storeSubscription: null,
      // Apollo Client for use with react-apollo
      client: apolloClient,
      // intl instance as it can be get with injectIntl
      intl,
      locale,
      httpClient,
      translate,
      showNotification,
      focus,
      socket: {},
    };

    const route = await router.resolve(context);
    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    const rootComponent = <App context={context}>{route.component}</App>;
    await getDataFromTree(rootComponent);
    // this is here because of Apollo redux APOLLO_QUERY_STOP action
    await Promise.delay(0);
    data.children = await ReactDOM.renderToString(rootComponent);
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        throw new Error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);
    data.scripts = Array.from(scripts);

    // Furthermore invoked actions will be ignored, client will not receive them!
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('Serializing store...');
    }
    // Client side configuration
    data.app = {
      version: config.version,
      apiUrl: config.api.clientUrl,
      staticFilesUrl: config.staticFilesUrl,
      socket: {
        host: config.io.clientHost,
        port: config.io.clientPort,
      },
      notifications: config.notifications,
      state: context.store.getState(),
      lang: locale,
      tokenId: config.auth.tokenId,
      apolloState: context.client.extract(),
      dateFormat: config.dateFormat,
      timezone: config.timezone,
      userAgent: req.headers['user-agent'],
      fibasePublicApiKey: process.env.FIREBASE_PUBLIC_API_KEY,
      defaultRoute: '/profile',
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (
    req.headers['content-type'] === 'application/json' ||
    req.headers['content-type'] === 'application/x-www-form-urlencoded'
  ) {
    return res.status(500).json({ success: false, errors: err.message });
  }
  const locale = req.language;
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
      app={{ lang: locale }}
    >
      {ReactDOM.renderToString(
        <IntlProvider locale={locale}>
          <ErrorPageWithoutStyle error={err} />
        </IntlProvider>,
      )}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
// const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
  app.listen(config.port, () => {
    console.info(`The server is running at http://localhost:${config.port}/`);
  });
}
//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;
