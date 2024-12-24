const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { roleRights } = require('../config/roles');
const { authMessage } = require('../config/httpMessages');
const APIError = require('../utils/ApiError');
const { User } = require('../models');
const logger = require('../config/logger');
const { status: httpStatus } = require('http-status');
const { authService } = require('../services');
const { tokenTypes } = require('../config/tokens');

const fetchUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user ? user.toObject() : null;
  } catch (error) {
    logger.error(`Error fetching user with ID: ${userId}`, error);
    throw error;
  }
};

const refreshTokens = async (req, res, cb, next) => {
  try {
    const decodedRefresh = jwt.verify(req.cookies.refresh, config.jwt.secret);
    const tokens = await authService.refreshAuth({
      refreshToken: req.cookies.refresh,
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
    });
    res.cookie(tokenTypes.ACCESS, tokens.access.token, {
      // httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      expires: tokens.access.expires,
    });

    if (decodedRefresh.type === tokenTypes.REFRESH) {
      const userObject = await fetchUser(decodedRefresh.sub);
      if (!userObject) {
        return res.status(401).json({
          status: httpStatus.UNAUTHORIZED,
          message: authMessage.USER_NOT_FOUND,
        });
      }

      req.context = {
        user: {
          ...userObject,
        },
      };

      if (cb && typeof cb === 'function') {
        cb();
      } else {
        next();
      }
    } else {
      return res.status(401).json({
        status: httpStatus.UNAUTHORIZED,
        message: authMessage.UNAUTHORIZED,
      });
    }
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const verifyToken = async (req, res, cb, next) => {
  const accessToken = req.cookies.access;
  const refreshToken = req.cookies.refresh;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      status: httpStatus.UNAUTHORIZED,
      message: authMessage.UNAUTHORIZED,
    });
  } else if (!accessToken && refreshToken) {
    return refreshTokens(req, res, cb, next);
  }

  try {
    const decoded = jwt.verify(accessToken, config.jwt.secret);
    if (decoded.type !== tokenTypes.ACCESS) {
      return res.status(401).json({
        status: httpStatus.FORBIDDEN,
        message: authMessage.INVALID_TOKEN,
      });
    }

    const userObject = await fetchUser(decoded.sub);
    if (!userObject) {
      return res.status(401).json({
        status: httpStatus.UNAUTHORIZED,
        message: authMessage.UNAUTHORIZED,
      });
    }

    req.context = {
      user: {
        ...userObject,
      },
    };
    cb();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      if (refreshToken) {
        return refreshTokens(req, res, cb, next);
      } else {
        return res.status(401).json({
          status: httpStatus.UNAUTHORIZED,
          message: authMessage.SESSION_EXPIRED,
        });
      }
    }
    logger.error(error);
    return res.status(401).json({
      status: httpStatus.UNAUTHORIZED,
      message: authMessage.UNAUTHORIZED,
    });
  }
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return verifyToken(
      req,
      res,
      async () => {
        try {
          if (requiredRights.length) {
            const userRights = roleRights.get(req?.context?.user?.role) || [];
            const hasRequiredRights = requiredRights.some((requiredRight) => {
              return userRights.includes(requiredRight);
            });
            if (
              !hasRequiredRights &&
              req?.params?._id?.toString() !==
                req?.context?.user?._id?.toString()
            ) {
              throw new APIError(403, authMessage.FORBIDDEN);
            }
          }
          next();
        } catch (error) {
          next(error);
        }
      },
      next
    );
  };

module.exports = { auth };
