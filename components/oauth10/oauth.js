/**
 *  Module: OAuth
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telef�nica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Telefonica Digital
 *
 */

if (typeof OAuth === 'undefined' || !OAuth.Request) {
    (function() {
        String.prototype.to_rfc3986 = function()  {
                var tmp = encodeURIComponent(this);
                tmp = tmp.replace(/!/g, '%21');
                tmp = tmp.replace(/\*/g, '%2A');
                tmp = tmp.replace(/\(/g, '%28');
                tmp = tmp.replace(/\)/g, '%29');
                tmp = tmp.replace(/'/g, '%27');
                return tmp;
        };

        var OAuth = window.OAuth = {};

        function newOAuthParams(callback,consumerKey,accessToken) {
                var oauthParams = {
                        oauth_timestamp: '',
                        oauth_nonce: '',
                        oauth_consumer_key: consumerKey,
                        oauth_signature_method: 'HMAC-SHA1',
                        oauth_version: '1.0'
                };

                if (callback) {
                    oauthParams.oauth_callback = callback;
                }

                if (typeof accessToken !== 'undefined') {
                    oauthParams.oauth_token = accessToken;
                }

                oauthParams.oauth_nonce = generateNonce();
                oauthParams.oauth_timestamp =
                        Math.round((Date.now() / 1000)).toString();

                return oauthParams;
            }

            function serializeOAuthHeader(oparams,options) {
                var output = 'OAuth ';
                var SEPARATOR = ', ';
                var ENCLOSE = '"';

                if (options) {
                    if (options.asQueryString === true) {
                        output = '&';
                        SEPARATOR = '&';
                        ENCLOSE = '';
                    }
                }

                var sortedKeys = [];
                for (var key in oparams) {
                    sortedKeys.push(key);
                }
                sortedKeys.sort();

                var total = sortedKeys.length;

                for (var c = 0; c < total; c++) {
                    var key = sortedKeys[c];
                    var val = oparams[key];
                    if (val) {
                        output += key.to_rfc3986() + '=' + ENCLOSE +
                        val.to_rfc3986() + ENCLOSE + SEPARATOR;
                    }
                }

                return output.substring(0, output.length - SEPARATOR.length);
            }

            function generateOAuth(request,credentials,options) {
                var oparams = newOAuthParams(null, credentials.consumerKey
, credentials.accessToken);
                var allParams = {
                    oAuthParams: oparams,
                    httpRequest: request
                };

                oparams.oauth_signature = generateSignature(allParams,
                    credentials.consumerSecret, credentials.accessTokenSecret);

                return serializeOAuthHeader(oparams, options);
            }

            // Key function that generates the signature
            function generateSignature(request,consumerSecret,
                                       accessTokenSecret) {
                var keys = sortKeys(request);

                var parameterString = '';

                var total = keys.length;

                for (var c = 0; c < total; c++) {
                    var val = request.oAuthParams[keys[c]];
                    if (!val) {
                        val = request.httpRequest.params[keys[c]];
                    }

                    parameterString += keys[c] + '=' +
                                      val.toString().to_rfc3986();
                    if (c < total - 1) {
                        parameterString += '&';
                    }

                }

                window.console.log('Parameter String: ' + parameterString);

                var signatureBaseString = request.httpRequest.method + '&' +
                request.httpRequest.baseURL.to_rfc3986() + '&' +
                                                   parameterString.to_rfc3986();

                window.console.log('Signature Base String: ' +
                                                   signatureBaseString);

                var signingKey = consumerSecret.to_rfc3986() + '&' +
                                            accessTokenSecret.to_rfc3986();

                window.console.log('Signing Key:' + signingKey);

                var signatureBytes = Crypto.HMAC(Crypto.SHA1,
                            signatureBaseString, signingKey, { asBytes: true });

                var signature = Crypto.util.bytesToBase64(signatureBytes);

                window.console.log('Signature: ' + signature);

                return signature;
            }

            function sortKeys(allParams) {
                var keys = [];

                for (var key in allParams.oAuthParams) {
                    keys.push(key.to_rfc3986());
                }

                for (key in allParams.httpRequest.params) {
                    keys.push(key.to_rfc3986());
                }

                keys.sort();

                return keys;
            }

            function generateNonce() {
                var bytes = Crypto.util.randomBytes(20);

                return Crypto.util.bytesToBase64(bytes);
            }

            function serializeHttpParams(params) {
                var output = '';

                for (var p in params) {
                    output += (p + '=' + params[p].toString().to_rfc3986() +
                               '&');
                }

                return output.substring(0, output.length - 1);
            }

        var oRequest = OAuth.Request = function(httpRequest,oauthCredentials) {
            this.httpRequest = httpRequest;
            this.oAuthCredentials = oauthCredentials;
        }

        oRequest.prototype = {
            getURI: function() {
                var output = this.httpRequest.baseURL;

                if (this.httpRequest.method === 'GET') {
                    output += ('?' +
                                serializeHttpParams(this.httpRequest.params));
                }

                return output;
            },

            getAuthHeader: function(options) {
                return generateOAuth(
                            this.httpRequest, this.oAuthCredentials, options);
            }
        };

    })();
}
