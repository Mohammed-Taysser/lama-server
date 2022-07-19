const statusCode = require('../utilities/statusCode');
const schema = require('../schema/users.schema');

module.exports = async (request, response, next) => {
	'use strict';

	await schema
		.findOne({ _id: request.user._id })
		.then((results) => {
			const { role } = results;
			if (role && role === 'admin') {
				next();
			} else {
				response
					.status(statusCode.error.unauthorized)
					.json({ error: "You Don't Have Permission" });
			}
		})
		.catch((error) => {
			response.status(statusCode.error.unauthorized).json({ error });
		});
};
