const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).json({
      message: 'User created successfully',
      status: httpStatus.CREATED,
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
    const filter = pick(req.query, ['name', 'role']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await userService.queryUsers(filter, options);
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
    const user = await userService.getUserById(req.params.userId);
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

const updateUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.status(httpStatus.OK).json({
      message: 'User updated successfully',
      status: httpStatus.OK,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  try {
    const user = await userService.deleteUserById(req.params.userId);
    res.status(httpStatus.OK).json({
      message: 'User deleted successfully',
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
