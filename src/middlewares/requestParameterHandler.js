const { parseJSON } = require('../utils/helpers');

const getRequestParams = (req) => {
  let allParams = {};
  let params = req.params || {};
  let body = req.body || {};
  let query = req.query || {};
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      allParams[key] = params[key];
    }
  }

  for (var key in body) {
    if (allParams[key] === undefined) {
      allParams[key] = body[key];
    }
  }

  for (var key in query) {
    if (allParams[key] === undefined) {
      allParams[key] = parseJSON(query[key]);
    }
  }
  allParams.context = req.user || {};

  return allParams;
};

// Middleware to consolidate request parameters
const aggregateRequestDataMiddleware = (req, res, next) => {
  req.allParams = getRequestParams(req);
  next();
};

module.exports = aggregateRequestDataMiddleware;
