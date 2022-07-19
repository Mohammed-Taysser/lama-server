const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: [true, 'username not provided!'],
			unique: [true, 'username already exists!'],
		},
		role: {
			type: String,
			default: 'user',
			enum: ['admin', 'user'],
			required: [true, 'Please specify user role'],
		},
		firstName: { type: String },
		lastName: { type: String },
		avatar: {
			type: String,
			default:
				'https://res.cloudinary.com/mohammed-taysser/image/upload/v1654679434/paperCuts/authors/avatar-2_grpukn.png',
		},
		cover: {
			type: String,
			default:
				'https://res.cloudinary.com/mohammed-taysser/image/upload/v1657350049/lama/users/5437842_py0e8h.jpg',
		},
		email: {
			type: String,
			required: [true, 'email not provided!'],
			unique: [true, 'email already exists!'],
		},
		password: { type: String, required: [true, 'password not provided!'] },
		followers: {
			type: Array,
			default: [],
		},
		following: {
			type: Array,
			default: [],
		},
		info: {
			type: String,
		},
		relationship: {
			type: String,
		},
		city: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('User', userSchema);
