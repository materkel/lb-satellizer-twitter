'use strict';

const request = require('request-promise'),
      qs = require('querystring');

module.exports = (config) => {
	const authType = 'oauth1',
        consumerKey = config.consumerKey,
        consumerSecret = config.consumerSecret,
        callbackUrl = config.callbackUrl || null,

        requestTokenUrl = 'https://api.twitter.com/oauth/request_token',
        accessTokenUrl = 'https://api.twitter.com/oauth/access_token',
        profileUrl = 'https://api.twitter.com/1.1/users/show.json?user_id=';

	let userId = null,
	    userName = null,
	    userEmail = null;


  const retrieveProfile = (response) => {
    const oauthData = {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      oauth_token: response.oauth_token
    };
    return request({ url: `${profileUrl}${response.user_id}`, oauth: oauthData})
      .then((res) => {
        res = JSON.parse(res);
        userId = res.id;
        userName = res.name;
        return true;
      });
  };

  return {
    getUserData: () => {
      return {
        userId,
        userName,
        userEmail
      };
    },

    getAuthType: () => {
      return authType;
    },

    authorize: (req) => {
      let oauthData = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      };

      if (callbackUrl !== null) {
        oauthData.callback = callbackUrl;
      }

      return request
        .post({ url: requestTokenUrl, oauth: oauthData })
        .then((res) => {
          return qs.parse(res);
        });
    },

    authenticate: (req) => {
      const oauthData = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token: req.body.oauth_token,
        verifier: req.body.oauth_verifier
      };

      return request
        .post({ url: accessTokenUrl, oauth: oauthData})
        .then((res) => {
          return qs.parse(res);
        })
        .then((res) => {
          return retrieveProfile(res);
        });
    }
  };
};
