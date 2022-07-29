const dotenv = require('dotenv');
const statusCode = require('../utilities/statusCode');

dotenv.config();

// eslint-disable-next-line no-undef
const { API_KEYS = [] } = process.env;

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked

module.exports = async (request, response, next) => {
	const key = request.headers['x-api-key'];

	// key isn't present
	if (!key) {
		return response
			.status(statusCode.error.serverError)
			.json({ error: 'api key required' });
	}

	// key is invalid
	if (!API_KEYS.includes(key)) {
		return response
			.status(statusCode.error.serverError)
			.json({ error: 'invalid api key' });
	}
	// all good, store request.key for route access
	request.key = key;
	next();
};
