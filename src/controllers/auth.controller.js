const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require('../services');
const { authMessage } = require('../config/httpMessages');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  try {
    const { name, email, password } = req.allParams;
    const user = await userService.createUser({ name, email, password });
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json({
      user,
      tokens,
      status: httpStatus.CREATED,
      message: authMessage.ACCOUNT_CREATED_SUCCESSFULLY,
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
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.OK).json({
      user,
      tokens,
      status: httpStatus.OK,
      message: authMessage.USER_LOGGED_IN_SUCCESSFULLY,
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
    const { refreshToken } = req.allParams;
    await authService.logout(refreshToken);
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
    const { refreshToken } = req.allParams;
    const tokens = await authService.refreshAuth({ refreshToken });
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
    const user = await userService.getUserById(req.user._id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
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
