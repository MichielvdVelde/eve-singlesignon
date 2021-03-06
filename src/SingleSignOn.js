'use strict';

import * as pkg from '../package';
import { stringify as querystringify } from 'querystring';
import { default as request } from 'request-promise';

/**
 * Lists the available servers
**/
export const SERVERS = {
  LIVE: 'https://login.eveonline.com',
  TEST: 'https://sisilogin.testeveonline.com'
};

/**
 * Provides an interface to Eve Online's Single Sign-On system
*/
export class SingleSignOn {

  /**
   * Create a new instance of the SingleSignOn class with the given properties set
   * @param string client_id The client ID from the developers section
   * @param string secret_key The client secret from the developers section
   * @param string redirect_url The redirect URL from the developers section
   * @param array options Optional option settings
   * @param string server The URL to the server to use
  **/
  constructor(client_id = null, secret_key = null, redirect_uri = null, options = {}, server = SERVERS.LIVE) {

    if(client_id === null)
      throw new TypeError('client id can not be null');
    if(secret_key === null)
      throw new TypeError('secret can not be null');
    if(redirect_uri === null)
      throw new TypeError('redirect uri can not be null');

    this._client_id = client_id;
    this._secret_key = secret_key;
    this._redirect_uri = redirect_uri;
    this._server = server;
    this._options = options;

    if(!this._options.useragent) this._options.useragent = pkg.name + '/' + pkg.version + ' - nodejs/' + process.version + ' - ' + pkg.homepage;

  }

  /**
   * Get the client ID
   * @return string The client ID
  **/
  get clientId() {
    return this._client_id;
  }

  /**
   * Get the secret key
   * @return string The secret key
  **/
  get secretKey() {
    return this._secret_key;
  }

  /**
   * Get the redirect (callback) URI
   * @return string the redirect URI
  **/
  get redirectUri() {
    return this._redirect_uri;
  }

  /**
   * Get the server that's being used
   * @return string The server URI
  **/
  get server() {
    return this._server;
  }

  /**
   * Set the server URI to use
   * @param string server The server URI to use
  **/
  set server(server) {
    this._server = server;
  }

  /**
   * Build a redirect URL where the client will be sent to
   * @param string state Optional state parameter
   * @param string scope Optional space-delimitd scope list
   * @return string A fully qualified redirect URL
  **/
  getRedirectUrl(state = null, scope = null) {

    let options = {
      'response_type': 'code',
      'client_id': this._client_id,
      'redirect_uri': this._redirect_uri
    };

    if(scope !== null) options.scope = scope;
    if(state !== null) options.state = state;

    return this._server + '/oauth/authorize/?' + querystringify(options);
  }

  /**
   * Use an authorization code or refresh token to obtain a fresh access token
   * @param string code The authorization code or refresh token to use
   * @param bool refresh_token Set to true if tou use a refresh token
   * @return Promise
  **/
  getAccessToken(code, refresh_token = false) {
    let options = {
      method: 'POST',
      uri: this._server + '/oauth/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(this._client_id + ':' + this._secret_key)).toString('base64')
      },
      form: {
        grant_type: 'authorization_code',
        code: code
      }
    };

    if(refresh_token) {
      options.form = {
        grant_type: 'refresh_token',
        refresh_token: code
      };
    }

    return this._request(options);
  }

  /**
   * Verify an access token an retrieve basic information
   * @param string access_token The access token to verify
   * @return Promise
  **/
  verifyAccessToken(access_token) {
    let options = {
      method: 'GET',
      uri: this._server + '/oauth/verify',
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    };

    return this._request(options);
  }

  /**
   * Internal method for making requests
   * @param array options Request options
  **/
  _request(options) {
    return new Promise((resolve, reject) => {
      options.simple = false;
      request(options)
        .then((result) => {
          result = JSON.parse(result);
          if(result.error) return reject(new Error('SSO Error: ' + result.error + ' (' + result.error_description + ')'));
          return resolve(result);
        })
        .catch(reject);
    });
  }
}
