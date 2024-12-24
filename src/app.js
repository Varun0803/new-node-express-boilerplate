const express = require('express');
const helmet = require('helmet');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { status: httpStatus } = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const apiLogger = require('./middlewares/auditLogger');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.use('/v1/docs', express.static('src/docs/schemas'));
app.set('trust proxy', true);
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// sanitize request data
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});
app.use(mongoSanitize());

// gzip compression
app.use(compression());

const corsOptions = {
  origin: config.allowedOrigins,
  credentials: true,
};
// enable cors
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (config.logger.enable) {
  app.use((req, res, next) =>
    apiLogger(config.logger.allowedRequestTypes, req, res, next)
  );
}

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use((req, res, next) => {
    authLimiter(req, res, next);
  });
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
