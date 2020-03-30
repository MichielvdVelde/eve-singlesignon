# Single Sign-On (SSO) support for Eve Online

***DEPRECATED*** Use [eve-sso](https://github.com/MichielvdVelde/eve-sso) instead!

This module provides a simple interface to [Eve Online](https://eve-online.com)'s Single Sign-On
oAuth process. Requested access tokens can then be used to authenticate an Eve
character or to access the RESTful CREST API.

## Install

```
npm install eve-singlesignon --save
```

## Set up

In order to use Single Sign-On feature, you first need to create a new application
in the [developer section](https://developers.eveonline.com).

This will give you the required **client ID** and **secret**. You will need to give
the **redirect (or callback) URL**, the URL where the client will be redirected to after logging in
(this is the */sso_callback* in the example below).

## Resources

* [Authentication Flow](http://eveonline-third-party-documentation.readthedocs.io/en/latest/sso/authentication.html) (in `getAccessToken(code)`)
* [Obtaining a Character ID](http://eveonline-third-party-documentation.readthedocs.io/en/latest/sso/obtaincharacterid.html) (in `verifyAccessToken()`)
* [Refresh Tokens](http://eveonline-third-party-documentation.readthedocs.io/en/latest/sso/refreshtokens.html) (`getAccessToken()` with a refresh token)

## Example with Express

This is an incomplete and minimalistic example of how to use the most basic
functionality. Refer to the source code for further inline documentation.

```js
import { default as express } from 'express';
import { SingleSignOn } from 'eve-singlesignon';

const app = express();

// Here you can provide the required parameters
const CLIENT_ID = 'client_id';
const SECRET_KEY = 'secret_key';
const CALLBACK_URL = 'http://example.com/sso_callback';

// Create a new instance with the set parameters
const sso = new SingleSignOn(CLIENT_ID, SECRET_KEY, CALLBACK_URL);

// Refer the client to the Eve Online SSO login screen on login
app.get('/login', function(req, res) {
	return res.redirect(sso.getRedirectUrl());
});

// This is the callback that is called when the client has logged in
app.get('/sso_callback', function(req, res) {
	// Get an access token for this authorization code
	sso.getAccessToken(req.query.code).then(result => {
		// The result contains the access token and expiry time
		console.log('Access Token:', result.access_token);
		console.log('Expires in:', result.expires_in);
		// Store the access token so you can use it later

		// Access basic character info
		return sso.verifyAccessToken(result.access_token);
	})
	.then(result => {
		// We now have some basic info...
		console.log('Character ID:', result.CharacterID);
		console.log('Character Name:', result.CharacterName);
	})
	.catch(err => {
		// An error occurred
	});
});

// Start the server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
```

## Changelog

* v0.0.5 - 28 August 2016
  * Update readme
* v0.0.4 - 28 May 2016
  * Move the `simple` request option to `_request`
* v0.0.2/v0.0.3 - 26 May 2016
  * (0.0.3) Added getters for most constructor parameters and setter for server URI
  * (0.0.2) Fixed getting an access token from a refresh token
* v0.0.1 - 25 May 2016
  * Initial release

## License

Copyright 2016 Michiel van der Velde.

This software is licensed under the [MIT License](LICENSE)
