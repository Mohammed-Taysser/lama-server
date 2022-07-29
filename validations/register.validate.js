const { check, validationResult } = require('express-validator');
const statusCode = require('../utilities/statusCode');

const schema = require('../schema/users.schema');

module.exports = [
	check('password')
		.trim()
		.escape()
		.not()
		.isEmpty()
		.withMessage('password can not be empty!')
		.bail()
		.isLength({ min: 8 })
		.withMessage('Minimum 8 characters required!')
		.bail()
		.isStrongPassword()
		.withMessage('please provide strong password!')
		.bail(),
	check('email')
		.trim()
		.normalizeEmail()
		.not()
		.isEmpty()
		.withMessage('email an not be empty!')
		.bail()
		.isEmail()
		.withMessage('Invalid email address!')
		.bail()
		.custom((value) =>
			schema.findOne({ email: value }).then((user) => {
				if (user) {
					return Promise.reject('E-mail already in use');
				}
			})
		)
		.bail(),
	check('username')
		.trim()
		.escape()
		.not()
		.isEmpty()
		.withMessage('username can not be empty!')
		.bail()
		.isLength({ min: 8 })
		.withMessage('Minimum 8 characters required!')
		.bail()
		.isSlug()
		.withMessage('please provide username!')
		.bail()
		.custom((value) =>
			schema.findOne({ username: value }).then((user) => {
				if (user) {
					return Promise.reject('username already in use');
				}
			})
		)
		.bail(),
	(request, response, next) => {
		const errors = validationResult(request);
		if (!errors.isEmpty())
			return response
				.status(statusCode.error.badRequest)
				.json({ errors: errors.array() });
		next();
	},
];
