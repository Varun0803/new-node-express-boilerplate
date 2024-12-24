const User = require('./user.model');
const config = require('../config/config');
const APIError = require('../utils/ApiError');
const { status: httpStatus } = require('http-status');

const seedUsers = async () => {
  try {
    const admin = {
      name: config.defaultAdmin.name,
      email: config.defaultAdmin.email,
      password: config.defaultAdmin.password,
      role: 'admin',
    };
    const user = await User.findOne(admin);

    if (!user) {
      await User.create(admin);
    }

    return true;
  } catch (err) {
    throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

module.exports = {
  seedUsers,
};
