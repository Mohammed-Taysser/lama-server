const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const statusCode = require('./utilities/statusCode');
require('dotenv').config();

const app = express();

// Logger
app.enable('verbose errors');
app.use(logger('dev'));

// Config
// eslint-disable-next-line no-undef
const { PORT = 8080, MONGO_URL = '' } = process.env;

// Connect To DB
mongoose
	.connect(MONGO_URL)
	.then(() => {
		app.use('/api/health-check', (_request, response) =>
			response.status(statusCode.success.ok).json({ status: 'OK' })
		);

		app.listen(PORT, () => {
			console.log(`Lama Server listening on port:${PORT}`);
		});
	})
	.catch((error) => {
		console.log(error);
	});
