const { status: httpStatus } = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { authMessage } = require('../config/httpMessages');

const createUser = catchAsync(async (req, res) => {
  try {
    const { name, email, password } = req.allParams;
    const user = await userService.createUser({ name, email, password });
    res.status(httpStatus.CREATED).json({
      message: authMessage.USER_CREATED_SUCCESSFULLY,
      status: httpStatus.CREATED,
      _id: user._id,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const getUsers = catchAsync(async (req, res) => {
  try {
    const {
      fields = {},
      filter = {},
      options = {},
      context: { user = {} },
    } = req.allParams;
    const result = await userService.queryUsers({ filter, fields, options });
    res.status(httpStatus.OK).json({
      data: result,
      status: httpStatus.OK,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const getUser = catchAsync(async (req, res) => {
  try {
    const { _id, fields, options } = req.allParams;
    const user = await userService.getUserById({ _id, fields, options });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, authMessage.USER_NOT_FOUND);
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

const updateUser = catchAsync(async (req, res) => {
  try {
    let { _id, context, ...update } = req.allParams || {};
    const user = await userService.updateUserById({ _id, update, context });
    if (user) {
      res.status(httpStatus.OK).json({
        message: authMessage.USER_UPDATED_SUCCESSFULLY,
        status: httpStatus.OK,
        _id: user._id,
      });
    }
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  try {
    let { _id, filter, options } = req.allParams || {};

    _id = _id || filter?._id || null;
    options = options || {};

    const user = await userService.deleteUserById({ _id, options });
    res.status(httpStatus.OK).json({
      message: authMessage.USER_DELETED_SUCCESSFULLY,
      status: httpStatus.NO_CONTENT,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
