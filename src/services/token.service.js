const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const httpStatus = require('http-status');
const config = require('../config/config');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { authMessage } = require('../config/httpMessages');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {DateTime} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: Math.floor(DateTime.now().toSeconds()),
    exp: Math.floor(expires.toSeconds()),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {DateTime} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires,
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Session Expired');
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage.INVALID_TOKEN);
  }
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, authMessage.INVALID_TOKEN);
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = DateTime.now().plus({
    minutes: config.jwt.accessExpirationMinutes,
  });

  const accessToken = generateToken(
    user.id,
    accessTokenExpires.toUTC(),
    tokenTypes.ACCESS
  );

  const refreshTokenExpires = DateTime.now().plus({
    days: config.jwt.refreshExpirationDays,
  });

  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires.toUTC(),
    tokenTypes.REFRESH
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires.toUTC(),
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toUTC(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toUTC(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, authMessage.USER_NOT_FOUND);
  }
  const expires = DateTime.now().plus({
    minutes: config.jwt.resetPasswordExpirationMinutes,
  });

  const resetPasswordToken = generateToken(
    user.id,
    expires.toUTC(),
    tokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires.toUTC(),
    tokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = DateTime.now().plus({
    minutes: config.jwt.verifyEmailExpirationMinutes,
  });

  const verifyEmailToken = generateToken(
    user.id,
    expires.toUTC(),
    tokenTypes.VERIFY_EMAIL
  );
  await saveToken(
    verifyEmailToken,
    user.id,
    expires.toUTC(),
    tokenTypes.VERIFY_EMAIL
  );
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
