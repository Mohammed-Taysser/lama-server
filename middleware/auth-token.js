const statusCode = require('../utilities/statusCode');
const { verifyToken } = require('../utilities/jwt');

module.exports = async (request, response, next) => {
	'use strict';
	const token = request.headers['authorization'];

	if (token) {
		await verifyToken(token, (error, user) => {
			if (error) {
				response
					.status(statusCode.error.forbidden)
					.json({ error: `you aren't authorize, token is invalid` });
			} else {
				request.user = user;
				next();
			}
		});
	} else {
		response
			.status(statusCode.error.unauthorized)
			.json({ error: 'no token provide' });
	}
};
