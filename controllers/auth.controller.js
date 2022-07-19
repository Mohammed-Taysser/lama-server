const bcrypt = require('bcryptjs');
const schema = require('../schema/users.schema');
const statusCode = require('../utilities/statusCode');
const hashPassword = require('../utilities/hashPassword');
const loginValidation = require('../validations/login.validate');
const registerValidation = require('../validations/register.validate');
const { generateToken } = require('../utilities/jwt');

/**
 * Validate Register Data, Then Create New User
 * @description Create New User
 * @method POST
 */
exports.register = async (request, response) => {
	const errorAsObject = await registerValidation(request.body);

	if (Object.keys(errorAsObject).length === 0) {
		try {
			const hashedPassword = await hashPassword(request.body.password);
			const newUser = new schema({
				username: request.body.username,
				email: request.body.email,
				password: hashedPassword,
			});
			const user = await newUser.save();
			const token = await generateToken(user);
			response.status(statusCode.success.created).json({ user, token });
		} catch (error) {
			response.status(statusCode.error.serverError).json({ error });
		}
	} else {
		response.status(statusCode.error.badRequest).json({ error: errorAsObject });
	}
};

/**
 * Check Login Data, Then Login User
 * @description Create New User
 * @method POST
 */
exports.login = async (request, response) => {
	const { email, password } = request.body;

	const errorAsObject = loginValidation(email, password);

	if (Object.keys(errorAsObject).length === 0) {
		try {
			// user not exist
			const user = await schema.findOne({ email });
			if (!user) {
				return response.status(statusCode.error.serverError).json({
					error: {
						notExist: 'user not exist',
					},
				});
			}
			// password is bad
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return response.status(statusCode.error.serverError).json({
					error: {
						password: 'Password Not Correct',
					},
				});
			}
			// every thing ok
			const token = await generateToken(user);
			response.status(statusCode.success.ok).json({
				user,
				token,
			});
		} catch (error) {
			response.status(statusCode.error.serverError).json({ error });
		}
	} else {
		response
			.status(statusCode.error.serverError)
			.json({ error: errorAsObject });
	}
};
