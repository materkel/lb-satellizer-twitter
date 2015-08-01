var request = require('request-promise');
var qs = require('querystring');

module.exports = Twitter;

function Twitter (config) {
	this.authType = 'oauth1';
	this.userId = null;
	this.userName = null;
	this.userEmail = null;
	this.consumerKey = config.consumerKey;
	this.consumerSecret = config.consumerSecret;
	this.callbackUrl = config.callbackUrl || null;

	this.requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    this.accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    this.profileUrl = 'https://api.twitter.com/1.1/users/show.json?user_id=';
}

Twitter.prototype.authorize = function(req) {
	var self = this;

	var oauthData = {
		consumer_key: self.consumerKey,
		consumer_secret: self.consumerSecret
	};

	if (self.callbackUrl !== null) {
		oauthData.callback = self.callbackUrl;
	}

	return request.post({ url: self.requestTokenUrl, oauth: oauthData })
		.then(function(response) {
			console.log(response);
			return qs.parse(response);
		});
}; 

Twitter.prototype.authenticate = function(req) {
	var self = this;
	var oauthData = {
		consumer_key: self.consumerKey,
		consumer_secret: self.consumerSecret,
		token: req.body.oauth_token,
		verifier: req.body.oauth_verifier
	};

	return request.post({ url: self.accessTokenUrl, oauth: oauthData})
		.then(function(response) {
			return qs.parse(response);
		})
		.then(function(response) {
			return self.retrieveProfile(response);
		});
};

Twitter.prototype.retrieveProfile = function(response) {
	var self = this;
	var oauthData = {
		consumer_key: self.consumerKey,
		consumer_secret: self.consumerSecret,
		oauth_token: response.oauth_token
	};

	return request({ url: self.profileUrl+response.user_id, oauth: oauthData})
		.then(function(response) {
			self.userId = response.id;
			self.userName = response.name;
			return true;
		});
};