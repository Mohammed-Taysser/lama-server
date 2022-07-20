const { check, validationResult } = require('express-validator');
const statusCode = require('../utilities/statusCode');

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
