const bcrypt = require('bcryptjs');
const schema = require('../schema/users.schema');
const statusCode = require('../utilities/statusCode');
const hashPassword = require('../utilities/hashPassword');
const { generateToken } = require('../utilities/jwt');

/**
 * Validate Register Data, Then Create New User
 * @description Create New User
 * @method POST
 */
exports.register = async (request, response) => {
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
};

/**
 * Check Login Data, Then Login User
 * @description Create New User
 * @method POST
 */
exports.login = async (request, response) => {
	const { email, password } = request.body;

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
};
