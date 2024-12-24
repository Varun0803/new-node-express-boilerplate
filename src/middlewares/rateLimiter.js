const { rateLimit } = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { status: httpStatus } = require('http-status');
const config = require('../config/config');

const authLimiter = rateLimit({
  windowMs: config.rateLimitTime,
  limit: config.rateLimitMaxRequests,
  handler: function (req, res) {
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many requests, please try again later.'
    );
  },
});

module.exports = {
  authLimiter,
};
