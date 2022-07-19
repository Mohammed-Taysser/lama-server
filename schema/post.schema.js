const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
	{
		userId: {
			type: String,
			required: [true, 'userId not provided!'],
		},
		info: {
			type: String,
		},
		image: {
			type: String,
		},
		likes: {
			type: Array,
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Post', postSchema);
