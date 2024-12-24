const { status: httpStatus } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require('../services');
const { authMessage } = require('../config/httpMessages');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

const register = catchAsync(async (req, res) => {
  try {
    const { name, email, password } = req.allParams;
    const user = await userService.createUser({ name, email, password });
    const tokens = await tokenService.generateAuthTokens({
      user,
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
    });
    res.cookie(tokenTypes.ACCESS, tokens.access.token, {
      //httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: tokens.access.expires,
    });
    res.cookie(tokenTypes.REFRESH, tokens.refresh.token, {
      // httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      expires: tokens.refresh.expires,
    });
    res.status(200).json({
      message: authMessage.USER_CREATED_SUCCESSFULLY,
      status: 200,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.allParams;
    const user = await authService.loginUserWithEmailAndPassword({
      email,
      password,
    });
    const tokens = await tokenService.generateAuthTokens({
      user,
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
    });
    res.cookie(tokenTypes.ACCESS, tokens.access.token, {
      //httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: tokens.access.expires,
    });
    res.cookie(tokenTypes.REFRESH, tokens.refresh.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      expires: tokens.refresh.expires,
    });
    res.status(httpStatus.OK).json({
      message: authMessage.USER_LOGGED_IN_SUCCESSFULLY,
      status: httpStatus.OK,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const logout = catchAsync(async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;
    if (!refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, authMessage.INVALID_TOKEN);
    }
    await authService.logout({ refreshToken });
    res.clearCookie(tokenTypes.ACCESS);
    res.clearCookie(tokenTypes.REFRESH);
    res.status(httpStatus.OK).json({
      message: authMessage.USER_LOGGED_OUT_SUCCESSFULLY,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const refreshTokens = catchAsync(async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh;
    if (!refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, authMessage.SESSION_EXPIRED);
    }
    const tokens = await authService.refreshAuth({
      refreshToken,
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
    });
    res.cookie(tokenTypes.ACCESS, tokens.access.token, {
      // httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: tokens.access.expires,
    });
    res.status(httpStatus.OK).json({
      tokens,
      status: httpStatus.OK,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  try {
    const { email } = req.allParams;
    const resetPasswordToken = await tokenService.generateResetPasswordToken(
      email
    );
    await emailService.sendResetPasswordEmail(email, resetPasswordToken);
    res.status(httpStatus.OK).json({
      message: authMessage.PASSWORD_RESET_SENT_SUCCESSFULLY,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  try {
    const { token, password } = req.allParams;
    await authService.resetPassword({ token, password });
    res.status(httpStatus.OK).json({
      message: authMessage.PASSWORD_RESET_SUCCESSFULLY,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  try {
    const { context } = req.allParams;
    const { user } = context;
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(user.email, verifyEmailToken);
    res.status(httpStatus.OK).json({
      message: authMessage.VERIFICATION_EMAIL_SENT_SUCCESSFULLY,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const verifyEmail = catchAsync(async (req, res) => {
  try {
    const { token } = req.allParams;
    await authService.verifyEmail(token);
    res.status(httpStatus.OK).json({
      message: authMessage.EMAIL_VERIFICATION_SUCCESS,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: authMessage.EMAIL_VERIFICATION_FAILED,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const getUser = catchAsync(async (req, res) => {
  try {
    const { context } = req.allParams;
    const { user } = context;
    res.status(httpStatus.OK).json({
      data: user,
      status: httpStatus.OK,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  getUser,
};
