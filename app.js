const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const mongoose = require('mongoose');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config();

const statusCode = require('./utilities/statusCode');
const authApiKey = require('./middleware/auth-api-key');

const usersRoutes = require('./routes/users.route');
const authRoutes = require('./routes/auth.route');
const postsRoutes = require('./routes/posts.route');

const app = express();

// Logger
app.enable('verbose errors');
app.use(logger('dev'));

// Config
// eslint-disable-next-line no-undef
const { PORT = 8080, MONGO_URL = '' } = process.env;

// Middleware
app.use(helmet());

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: '30mb' }));
// parse application/json
app.use(bodyParser.json({ limit: '30mb' }));

// Make sure the body is parsed beforehand.
app.use(hpp());

// Compress all HTTP responses
app.use(
	compression({
		filter: (request, response) => {
			if (request.headers['x-no-compression']) {
				// don't compress responses with this request header
				return false;
			}
			// fallback to standard filter function
			return compression.filter(request, response);
		},
	})
);

app.use(
	rateLimit({
		windowMs: 60 * 60 * 1000, // 60 minutes
		max: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes)
		message:
			'Too many accounts created from this IP, please try again after an hour',
		handler: (_, response, __, options) =>
			response.status(options.statusCode).json({ error: options.message }),
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	})
);

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked
app.use('/api', authApiKey);

// Static Files
app.use(express.static('assets'));

// Connect To DB
mongoose
	.connect(MONGO_URL)
	.then(() => {
		app.use('/api/health-check', (_request, response) =>
			response.status(statusCode.success.ok).json({ status: 'OK' })
		);

		app.use('/api/auth', authRoutes);
		app.use('/api/users', usersRoutes);
		app.use('/api/posts', postsRoutes);

		app.listen(PORT, () => {
			console.log(`Lama Server listening on port:${PORT}`);
			console.info(`See: /api/health-check To Check Api Status`);
		});
	})
	.catch((error) => {
		console.log(error);
	});
