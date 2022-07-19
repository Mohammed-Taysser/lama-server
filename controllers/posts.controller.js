const schema = require('../schema/post.schema');
const userSchema = require('../schema/users.schema');
const statusCode = require('../utilities/statusCode');

/**
 * @description Get All Posts
 * @method GET
 */
exports.all = async (_request, response) => {
	'use strict';
	await schema
		.find()
		.then((results) => {
			response.status(statusCode.success.ok).json(results);
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Crete New Post
 * @method POST
 */
exports.create = async (request, response) => {
	const newPost = new schema({
		...request.body,
		userId: request.user._id,
	});

	await newPost
		.save()
		.then((results) => {
			response.status(statusCode.success.created).json(results);
		})
		.catch((error) => {
			response.status(statusCode.error.conflict).json({ error });
		});
};

/**
 * @description View Post
 * @method GET
 */
exports.view = async (request, response) => {
	const { id } = request.params;

	// No id Provide
	if (!id) {
		return response
			.status(statusCode.error.badRequest)
			.json({ error: 'id not provide!' });
	}

	// Everything Ok
	await schema
		.findOne({ _id: id })
		.then((results) => {
			if (results) {
				response.status(statusCode.success.ok).json(results);
			} else {
				response.status(statusCode.error.notFound).json({ post: results });
			}
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Update Post
 * @method PATCH
 */
exports.update = async (request, response) => {
	const { id } = request.params;

	// No id Provide
	if (!id) {
		return response.status(statusCode.error.badRequest).json({
			error: 'id is not provide!',
		});
	}

	const currentPost = await schema.findById(id);
	if (!currentPost) {
		return response.status(statusCode.error.badRequest).json({
			error: 'no post to be update!',
		});
	}

	// try to update other posts
	if (currentPost.userId.toString() !== request.user._id.toString()) {
		return response.status(statusCode.error.badRequest).json({
			error: "you can't update other posts",
		});
	}

	await schema
		.findByIdAndUpdate(id, request.body, { new: true })
		.then((results) => {
			response.status(statusCode.success.ok).json(results);
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Delete Post
 * @method DELETE
 */
exports.delete = async (request, response) => {
	const { id } = request.params;

	// No id Provide
	if (!id) {
		return response.status(statusCode.error.badRequest).json({
			error: 'id is not provide!',
		});
	}

	const currentPost = await schema.findById(id);
	if (!currentPost) {
		return response.status(statusCode.error.badRequest).json({
			error: 'no post to be delete!',
		});
	}

	// try to delete other posts
	if (currentPost.userId.toString() !== request.user._id.toString()) {
		return response.status(statusCode.error.badRequest).json({
			error: "you can't delete other posts",
		});
	}

	await schema
		.findByIdAndDelete(id)
		.then((results) => {
			if (results) {
				response.status(statusCode.success.ok).json(results);
			} else {
				response
					.status(statusCode.error.badRequest)
					.json({ error: 'post not exist' });
			}
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Like Or Unlike Post
 * @method PATCH
 */
exports.like = async (request, response) => {
	const { id: postId } = request.params;
	const { _id: userId } = request.user;

	// No post id Provide
	if (!postId) {
		return response.status(statusCode.error.badRequest).json({
			error: 'post id is not provide!',
		});
	}

	try {
		const post = await schema.findById(postId);

		let likes = post.likes;

		// un like
		if (likes.includes(userId)) {
			likes = likes.filter((item) => item.toString() !== userId.toString());
		} else {
			// like
			likes = [...likes, userId];
		}

		const updatedPost = await schema.findByIdAndUpdate(
			postId,
			{ likes },
			{ new: true }
		);
		response.status(statusCode.success.ok).json(updatedPost);
	} catch (error) {
		response.status(statusCode.error.serverError).json({ error });
	}
};

/**
 * @description Get Timeline Posts
 * @method GET
 */
exports.timeline = async (request, response) => {
	const { _id: id } = request.user;
	try {
		const user = await userSchema.findById(id);
		const userPosts = await schema.find({ userId: id });
		const friendPosts = await Promise.all(
			user.following.map((friendId) => schema.find({ userId: friendId }))
		);
		response
			.status(statusCode.success.ok)
			.json(userPosts.concat(...friendPosts));
	} catch (error) {
		response.status(statusCode.error.serverError).json({ error });
	}
};
