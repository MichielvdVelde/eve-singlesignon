# Single Sign-On (SSO) support for Eve Online

This module provides a simple interface to [Eve Online](https://eve-online.com)'s Single Sign-On
oAuth process. Requested access tokens can then be used to authenticate an Eve
character or to access the RESTful CREST API.

Further documentation is forthcoming. For now you can look at the code to find out
which options (besides the ones shown in the example below) this package supports.

## Install

```
npm install eve-singlesignon --save
```

## Set up

In order to use Single Sign-On feature, you first need to create a new application
in the [developer section](https://developers.eveonline.com).

This will give you the required **client ID** and **secret**. You will also need to give
the **redirect (or callback) URL**, the URL where the client will be redirected to after logging in.

## Example with Express

This is an incomplete and minimalistic example of how to use the most basic
functionality. Refer to the source code for further inline documentation.

```js
import { default as express } from 'express';
import { SingleSignOn } from 'eve-singlesignon';

const sso = new SingleSignOn('client_id', 'client_secret', 'redirect_url');
const app = express();

// Refer the client to the Eve Online SSO login screen on login
app.get('/login', function(req, res) {
	return res.redirect(sso.getRedirectUrl());
});

// This is the callback that is called when the client has logged in
app.get('/sso_callback', function(req, res) {

	// Get an access token for this authorization code
	sso.getAccessToken(req.query.code)
		.then((result) => {

			// The result contains the access token and expiry time
			console.log('Access Token:', result.access_token);
			console.log('Expires in:', result.expires_in);

			// Store the access token so you can use it later
		})
		.catch((err) => {
			// An error occurred
		});
});
```

## Changelog

* v0.0.2 - 26 May 2016
 * Fixed getting an access token from a refresh token
* v0.0.1 - 25 May 2016
 * Initial release

## License

Copyright 2016 Michiel van der Velde.

This software is licensed under the [MIT License](LICENSE)
