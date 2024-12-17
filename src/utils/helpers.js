const config = require('../config/config');
const APIError = require('./ApiError');

const isEmpty = (value) => {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string' && value.trim() === '') return true;

  if (Array.isArray(value) && value.length === 0) return true;

  if (typeof value === 'object' && Object.keys(value).length === 0) return true;

  return false;
};

const parseJSON = (param) => {
  try {
    if (param) {
      return typeof param === 'object' ? param : JSON.parse(param);
    }
    return {};
  } catch (error) {
    return {};
  }
};
const splitNonAlphanumeric = (inputString) => {
  const regex = /[^a-zA-Z0-9]+/;
  const resultArray = inputString.split(regex);

  return resultArray.filter((element) => element !== '');
};

const uniqueArray = ({ array = [] }) => {
  let result = array?.length > 0 ? [...array] : [];
  result.filter(function (item, pos, self) {
    return self.indexOf(item) == pos;
  });
  return result;
};

const populateFunction = async ({ docsPromise, populate }) => {
  if (populate) {
    docsPromise = Object.entries(populate).reduce(
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
      docsPromise
    );
  }
  return docsPromise;
};

const roundOffFunction = (number, decimals = 2) => {
  if (number === 0) {
    return 0;
  }
  if (isNaN(number) || isNaN(decimals)) {
    return 0;
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(number * multiplier) / multiplier;
};

module.exports = {
  isEmpty,
  parseJSON,
  splitNonAlphanumeric,
  uniqueArray,
  populateFunction,
  roundOffFunction,
};
