# Admin API OpenID Connect Example

This is an example project to show how to connect to the Banno Admin API using [OpenID Connect](https://openid.net/connect/) (an identity layer on top of [OAuth 2.0](https://oauth.net/2/)).

This repository includes an example that uses [Node.js](https://nodejs.org) with the [Passport](http://www.passportjs.org/) authentication middleware to handle the OpenID Connect protocol.

If you prefer to see a simple example of just the auth code flow for the Admin API, follow the  [Admin API Authentication with Command Line Quickstart on JackHenry.Dev](https://jackhenry.dev/open-api-docs/admin-api/quickstarts/authentication-authcode-commandline/).

# Prerequisites

Before you get started, you'll need to have access to the Banno Back Office.

# Installation

## 1) Install software prerequisites

The example is built for [Node.js](https://nodejs.org) and [npm](https://www.npmjs.com/).

If you don't have these installed on your system already, you may want to install a Node Version Manager such as [nvm](https://github.com/nvm-sh/nvm).

## 2) Clone the repository

The cloned repository includes everything that you need for the next step.

## 3) Credentials
In the `config.js` file add in your `client_id` and `client_secret`.

## 4) Install project dependencies

From the repository root folder, run this command in the terminal:

```
npm install
```

# Running the example locally

After you've completed the installation steps, run this command in the terminal from the repository root folder:

```
npm run start
```

The server will now be running locally. You'll see this log statement in the terminal:

```
Environment: local
Server listening on https://localhost:8080...
```

Next, go to https://localhost:8080/ in a web browser.

Click on `Sign in with Banno` and sign in with your Banno Username and Password.

Once you are signed in, you'll be redirected to https://localhost:8080/me and see the [OpenID Connect claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims) for the user. 
Example of the output:
```
{
  "sub": "56073d86-6d0f-103a-8dfa-9d1647267a43",
  "family_name": "<last_name>",
  "given_name": "<first_name>",
  "middle_name": null,
  "name": "<full_name>",
  "picture": "https://banno.com/a/sentry/api/users/<user_id>/profile-image",
  "preferred_username": "<email>",
  "at_hash": "XVXcwEENbN45vmLUSwwbZw",
  "aud": "<string>",
  "exp": 1666315285,
  "iat": 1666311685,
  "iss": "https://www.banno.com/a/oidc-provider/api/v0"
}
```

You'll also see a log statement in the terminal that shows the access_token, id_token, and refresh_token:

```
TokenSet {
  access_token: '<lengthy-json-web-token-string>',
  expires_at: 1666312176,
  id_token: '<lengthy-json-web-token-string>',
  scope: 'openid',
  token_type: 'Bearer'
}
```

The access_token contains authorization information about your application regarding which actions it is allowed to perform via the Banno API. These actions map to the scopes (e.g. openid).

Both the access_token and id_token are in JSON Web Token format (see RFC 7519 for specification details).