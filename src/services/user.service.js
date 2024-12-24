const { status: httpStatus } = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { authMessage } = require('../config/httpMessages');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async ({ name, email, password }) => {
  try {
    if (await User.isEmailTaken(email)) {
      throw new ApiError(400, authMessage.EMAIL_ALREADY_REGISTERED);
    }
    return User.create({ name, email, password });
  } catch (err) {
    console.log(httpStatus.BAD_REQUEST);
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async ({ filter, fields, options }) => {
  const users = await User.paginate({ filter, fields, options });
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async ({ _id, fields = {}, options = {} }) => {
  try {
    const { populate, ...queryOptions } = options;
    let query = User.findById(_id, fields, queryOptions);

    if (populate) {
      query = Object.entries(populate).reduce(
        (currentQuery, [path, selectFields]) => {
          const fields = selectFields.reduce(
            (acc, data) => {
              const nestedFields = data.split('.');
              acc.select.push(nestedFields[0]);
              nestedFields.length > 1
                ? acc.populate.push({
                    path: nestedFields[0],
                    select: nestedFields[1],
                  })
                : '';
              return acc;
            },
            { select: [], populate: [] }
          );
          const select = fields.select.join(' ');
          const populateOptions = fields.populate;
          return currentQuery.populate({
            path,
            select,
            populate: populateOptions,
          });
        },
        query
      );
    }

    const result = await query.exec();
    return result;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async ({ _id, update, context }) => {
  let user = await User.findById(_id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, authMessage.USER_NOT_FOUND);
  }
  const { user: loggedInUser } = context || {};
  const { set, unset, push, pull, options = {} } = update || {};

  const updates = {};
  if (unset) {
    updates.$unset = unset;
  }
  if (pull) {
    updates.$pull = pull;
  }
  if (push) {
    updates.$push = push;
  }
  if (set) {
    if (set.email && (await User.isEmailTaken(set.email, _id))) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        authMessage.EMAIL_ALREADY_REGISTERED
      );
    }
    if (loggedInUser.role !== 'admin' || loggedInUser.id !== _id) {
      throw new ApiError(httpStatus.BAD_REQUEST, authMessage.FORBIDDEN);
    }
    updates.$set = set;
  }
  user = await User.findByIdAndUpdate({ _id }, updates, {
    ...options,
    new: true,
    runValidators: true,
  });
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async ({ _id, options }) => {
  const user = await User.findById(_id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, authMessage.USER_NOT_FOUND);
  }
  await User.deleteOne({ _id }, options);
  return true;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
