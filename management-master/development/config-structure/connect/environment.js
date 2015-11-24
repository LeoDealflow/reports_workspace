if (process.env.NODE_ENV === 'production') {
	var production = require('./production.js');
	module.exports.datastores = production.datastores;
}
else{
	var development = require('./development.js');
	module.exports.datastores = development.datastores;
}