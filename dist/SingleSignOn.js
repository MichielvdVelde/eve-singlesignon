'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SingleSignOn = exports.SERVERS = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _package = require('../package');

var pkg = _interopRequireWildcard(_package);

var _querystring = require('querystring');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Lists the available servers
**/
var SERVERS = exports.SERVERS = {
  LIVE: 'https://login.eveonline.com',
  TEST: 'https://sisilogin.testeveonline.com'
};

/**
 * Provides an interface to Eve Online's Single Sign-On system
*/

var SingleSignOn = exports.SingleSignOn = function () {

  /**
   * Create a new instance of the SingleSignOn class with the given properties set
   * @param string client_id The client ID from the developers section
   * @param string secret_key The client secret from the developers section
   * @param string redirect_url The redirect URL from the developers section
   * @param array options Optional option settings
   * @param string server The URL to the server to use
  **/

  function SingleSignOn() {
    var client_id = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var secret_key = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var redirect_uri = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    var server = arguments.length <= 4 || arguments[4] === undefined ? SERVERS.LIVE : arguments[4];

    _classCallCheck(this, SingleSignOn);

    if (client_id === null) throw new TypeError('client id can not be null');
    if (secret_key === null) throw new TypeError('secret can not be null');
    if (redirect_uri === null) throw new TypeError('redirect uri can not be null');

    this._client_id = client_id;
    this._secret_key = secret_key;
    this._redirect_uri = redirect_uri;
    this._server = server;
    this._options = options;

    if (!this._options.useragent) this._options.useragent = pkg.name + '/' + pkg.version + ' - nodejs/' + process.version + ' - ' + pkg.homepage;
  }

  /**
   * Get the client ID
   * @return string The client ID
  **/


  _createClass(SingleSignOn, [{
    key: 'getRedirectUrl',


    /**
     * Build a redirect URL where the client will be sent to
     * @param string state Optional state parameter
     * @param string scope Optional space-delimitd scope list
     * @return string A fully qualified redirect URL
    **/
    value: function getRedirectUrl() {
      var state = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var scope = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];


      var options = {
        'response_type': 'code',
        'client_id': this._client_id,
        'redirect_uri': this._redirect_uri
      };

      if (scope !== null) options.scope = scope;
      if (state !== null) options.state = state;

      return this._server + '/oauth/authorize/?' + (0, _querystring.stringify)(options);
    }

    /**
     * Use an authorization code or refresh token to obtain a fresh access token
     * @param string code The authorization code or refresh token to use
     * @param bool refresh_token Set to true if tou use a refresh token
     * @return Promise
    **/

  }, {
    key: 'getAccessToken',
    value: function getAccessToken(code) {
      var refresh_token = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var options = {
        method: 'POST',
        simple: false,
        uri: this._server + '/oauth/token',
        headers: {
          'Authorization': 'Basic ' + new Buffer(this._client_id + ':' + this._secret_key).toString('base64')
        },
        form: {
          grant_type: 'authorization_code',
          code: code
        }
      };

      if (refresh_token) {
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

  }, {
    key: 'verifyAccessToken',
    value: function verifyAccessToken(access_token) {
      var options = {
        method: 'GET',
        simple: false,
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

  }, {
    key: '_request',
    value: function _request(options) {
      return new Promise(function (resolve, reject) {
        (0, _requestPromise2.default)(options).then(function (result) {
          result = JSON.parse(result);
          if (result.error) return reject(new Error('SSO Error: ' + result.error + ' (' + result.error_description + ')'));
          return resolve(result);
        }).catch(reject);
      });
    }
  }, {
    key: 'clientId',
    get: function get() {
      return this._client_id;
    }

    /**
     * Get the secret key
     * @return string The secret key
    **/

  }, {
    key: 'secretKey',
    get: function get() {
      return this._secret_key;
    }

    /**
     * Get the redirect (callback) URI
     * @return string the redirect URI
    **/

  }, {
    key: 'redirectUri',
    get: function get() {
      return this._redirect_uri;
    }

    /**
     * Get the server that's being used
     * @return string The server URI
    **/

  }, {
    key: 'server',
    get: function get() {
      return this._server;
    }

    /**
     * Set the server URI to use
     * @param string server The server URI to use
    **/
    ,
    set: function set(server) {
      this._server = server;
    }
  }]);

  return SingleSignOn;
}();