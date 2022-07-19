const schema = require('../schema/users.schema');
const statusCode = require('../utilities/statusCode');
const hashPassword = require('../utilities/hashPassword');

/**
 * @description Get All User
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
 * @description View User
 * @method GET
 */
exports.view = async (request, response) => {
	const { id } = request.params;

	// No Username Provide
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
				response.status(statusCode.error.notFound).json({ user: results });
			}
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Update User
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

	const currentUser = await schema.findById(id);

	if (!currentUser) {
		return response.status(statusCode.error.badRequest).json({
			error: 'no user to be update!',
		});
	}

	// try to update other profile
	if (currentUser._id.toString() !== request.user._id.toString()) {
		return response.status(statusCode.error.badRequest).json({
			error: "you can't update others profile",
		});
	}

	const updatedValues = { ...request.body };
	if (updatedValues.password) {
		try {
			updatedValues.password = await hashPassword(updatedValues.password);
		} catch (error) {
			return response.status(statusCode.error.serverError).json({ error });
		}
	}

	await schema
		.findByIdAndUpdate(id, updatedValues, { new: true })
		.then((results) => {
			response.status(statusCode.success.ok).json(results);
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Delete User
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

	const currentUser = await schema.findById(id);

	if (!currentUser) {
		return response.status(statusCode.error.badRequest).json({
			error: 'no user to be delete!',
		});
	}

	// try to delete other profile
	if (currentUser._id.toString() !== request.user._id.toString()) {
		return response.status(statusCode.error.badRequest).json({
			error: "you can't delete others profile",
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
					.json({ error: 'user not exist' });
			}
		})
		.catch((error) => {
			response.status(statusCode.error.serverError).json({ error });
		});
};

/**
 * @description Follow Or Un Follow User 
 * @method PATCH
 */
exports.follow = async (request, response) => {
	const { id: userId } = request.params;
	const { _id: currentUserId } = request.user;

	// No follower id Provide
	if (!userId) {
		return response.status(statusCode.error.badRequest).json({
			error: 'follower id is not provide!',
		});
	}

	// you can't follow yourself
	if (userId === currentUserId) {
		return response.status(statusCode.error.conflict).json({
			error: "you can't follow or un follow yourself!",
		});
	}

	try {
		const user = await schema.findById(userId);
		const currentUser = await schema.findById(currentUserId);

		let currentUserFollowing = currentUser.following,
			userFollower = user.followers;

		// un follow
		if (currentUser.following.includes(user._id)) {
			userFollower = userFollower.filter(
				(item) => item._id.toString() !== currentUser._id.toString()
			);
			currentUserFollowing = currentUserFollowing.filter(
				(item) => item._id.toString() !== user._id.toString()
			);
		} else {
			// follow
			userFollower = [...userFollower, currentUser._id];
			currentUserFollowing = [...currentUserFollowing, user._id];
		}

		await schema.findByIdAndUpdate(userId, {
			followers: userFollower,
		});

		const updatedUser = await schema.findByIdAndUpdate(
			currentUserId,
			{
				following: currentUserFollowing,
			},
			{ new: true }
		);
		response.status(statusCode.success.ok).json(updatedUser);
	} catch (error) {
		response.status(statusCode.error.serverError).json({ error });
	}
};
