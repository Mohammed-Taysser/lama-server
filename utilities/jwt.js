const jwt = require('jsonwebtoken');
require('dotenv').config();

// eslint-disable-next-line no-undef
const { JWT_SECRET_KEY = '', JWT_LIFE_TIME } = process.env;

function generateToken(author) {
	'use strict';
	return jwt.sign(
		{
			_id: author._id,
			email: author.email,
			username: author.username,
			avatar: author.avatar,
			role: author.role,
		},
		JWT_SECRET_KEY,
		{
			expiresIn: JWT_LIFE_TIME,
		}
	);
}

function verifyToken(token, callback) {
	'use strict';
	return jwt.verify(token, JWT_SECRET_KEY, callback);
}

module.exports = { generateToken, verifyToken };
