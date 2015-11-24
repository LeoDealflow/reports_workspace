//GitHub
var oauthtoken = '';
var useragent = '';

//GoogleApps
var google = require('googleapis');
var analytics = google.analytics('v3');
var oauth2 = google.auth.OAuth2;
var oauth2client;


if (process.env.NODE_ENV === 'production') {
	oauth2client = new oauth2('key', 'secret', 'callback-url');
} else {
	oauth2client = new oauth2('key', 'secret', 'callback-url');
}
module.exports.github = { 'oauthtoken': oauthtoken, 'useragent': useragent }
module.exports.google = { 'oauth2 ': oauth2 , 'oauth2client': oauth2client }