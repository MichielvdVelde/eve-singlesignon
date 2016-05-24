# Single Sign-On (SSO) support for Eve Online

This module provides a simple interface to [Eve Online](https://eve-online.com)'s Single Sign-On
oAuth process. Requested access tokens can then be used to authenticate an Eve
character or to access the RESTful CREST API.

## Install

Not available on npm yet

## Set up

In order to use Single Sign-On feature, you first need to create a new application
in the [developer section](https://developers.eveonline.com).

This will give you the required *client ID* and *secret*. You will also need to give
the *redirect URL*, the URL where the client will be redirected to after logging in.

## Example with Express

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
app.get('sso_callback', function(req, res) {

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

## License

Copyright 2016 Michiel van der Velde.

This software is licensed under the [MIT License](LICENSE)
