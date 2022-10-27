/*
 * Copyright 2019 Jack Henry & Associates, Inc.®
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');
const { Strategy, Issuer, custom } = require('openid-client');
const passport = require('passport');
const express = require('express');
const session = require('express-session');
const config = require('./config');

const env = process.env.ENVIRONMENT;

(async () => {
  // Configure the OpenID Connect client based on the issuer.
  const issuer = await Issuer.discover(config.auth_wellknown);
  const client = new issuer.Client(config.client);

  client[custom.clock_tolerance] = 300; // to allow a 5 minute clock skew for verification

  // This example project doesn't include any storage mechanism(e.g. a database) for access tokens.
  // Therefore, we use this as our 'storage' for the purposes of this example.
  // This method is NOT recommended for use in production systems.
  let accessToken;

  const claims = {
  };

  // Configure the Passport strategy for OpenID Connect.
  const passportStrategy = new Strategy({
    client: client,
    params: {
      redirect_uri: config.client.redirect_uris[0],
      // For general information on scopes and claims, see https://jackhenry.dev/open-api-docs/authentication-framework/overview/openidconnectoauth/.
      //
      // For all available scopes, see https://banno.com/a/oidc-provider/api/v0/.well-known/openid-configuration
      scope: 'openid profile',
      claims: JSON.stringify({
        // Authenticated information about the user can be returned in these ways:
        // - as Claims in the Identity Token,
        // - as Claims returned from the UserInfo Endpoint,
        // - as Claims in both the Identity Token and from the UserInfo Endpoint.
        //
        // See https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter
        id_token: claims,
        userinfo: claims
      })
    },
    usePKCE: true
  }, (tokenSet, done) => {
    console.log(tokenSet);
    accessToken = tokenSet.access_token;
    return done(null, tokenSet.claims());
  });

  const port = process.env.PORT || 8080

  const app = express();
  app.use(session({
    secret: 'foo',
    resave: false,
    saveUninitialized: true,
    // Note that this example project's particular cookie technique will only work in Chromium-based browsers e.g.
    // - Google Chrome
    // - newer versions of Microsoft Edge
    //
    // Note that these cookies are going to be blocked by Chromium-based browsers in the future, and are already
    // blocked by Safari and Firefox by default.
    //
    // Safari can be made to work by disabling the "Prevent cross-site tracking" option. This will work for the developer,
    // but isn't a solution for production usage.
    cookie: {
      sameSite: 'none',
      secure: true
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use('openidconnect', passportStrategy);

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.get('/', (req, res, next) => {
    res.redirect('/auth');
  });

  // This routing path handles the start of an authentication request.
  // This is the path used in '/login.html' when you click the 'Sign in with Banno' button.
  app.get('/auth', (req, res, next) => {
    const options = {
      // Random string for state
      state: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    req.session.oAuthState = req.session.oAuthState || {};
    req.session.oAuthState[options.state] = {};
    // If we have a deep link path query parameter, save it in a state parameter
    // so that we can redirect to the correct page when the OAuth flow completes
    // See https://auth0.com/docs/protocols/oauth2/redirect-users
    if (req.query.returnPath && req.query.returnPath[0] === '/') {
      req.session.oAuthState[options.state].returnPath = req.query.returnPath;
    }
    return passport.authenticate('openidconnect', options)(req, res, next);
  }
  );

  // This routing path handles the authentication callback.
  // This path (including the host information) must be configured in Banno SSO settings.
  app.get('/auth/cb', (req, res, next) => {
    // This is an undocumented workaround for a quirk in how sessions are handled by this project's
    // specific OpenID Connect client (https://github.com/panva/node-openid-client) dependency.
    //
    // Developers must ensure that protections are put in place to ensure that requests arriving
    // without an existing session and state are not vulnerable to cross-site request forgeries.
    req.session[passportStrategy._key] = req.session[passportStrategy._key] || { 'key': 'DO_NOT_USE_IN_PRODUCTION' };

    passport.authenticate('openidconnect', (err, user, info) => {
      console.log(err, user, info);
      if (err || !user) {
        return res.redirect('/login.html');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        let nextPath = '/me';

        return res.redirect(nextPath);
      });
    })(req, res, next)
  });

  // This routing path shows the OpenID Connect claims for the authenticated user.
  // This path is where you'll be redirected once you sign in.
  app.get('/me', (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect('/login.html?returnPath=/me');
      return;
    }
    res.set('Content-Type', 'application/json').send(JSON.stringify(req.session.passport.user, undefined, 2));
  });

  app.use(express.static('public'));

  if (env === 'local') {
    // Running the server locally requires a cert due to HTTPS requirement for the authentication callback.
    const server = https.createServer({
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }, app)
    server.listen(port, () => console.log(`Server listening on https://localhost:${port}`))
  } else {
    app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
  }
})();