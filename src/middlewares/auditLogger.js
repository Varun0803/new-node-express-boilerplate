const logger = require('../config/logger');
const AuditLog = require('../models/auditLog.model');
const { calculateDuration } = require('../utils/timeUtils');

const formatErrorStack = (stack) => {
  if (typeof stack !== 'string') return '';
  const stackLines = stack.split('\n');
  const relevantStackLines = stackLines?.slice(0, 4);
  return relevantStackLines.join('\n');
};

const saveAuditLog = async (logData, req) => {
  try {
    if (logData.requestData && logData.requestData.body) {
      logData.requestData.body = redactSensitiveInfo(logData.requestData.body);
    }
    const auditLog = new AuditLog(logData);
    await auditLog.save();
    req.auditLogId = auditLog._id;
    logger.info('Audit log saved to MongoDB with _id: %s', req.auditLogId);
  } catch (error) {
    logger.error('Error saving audit log to MongoDB: %s', error);
  }
};

const updateAuditLogData = async (req, endTimestamp, additionalData = {}) => {
  try {
    if (req.responseData.statusCode >= 400 && req.responseData.data.stack) {
      additionalData.errorStack = formatErrorStack(req.responseData.data.stack);
    }
    const logData = {
      timestamp: req.startTimestamp,
      method: req.method,
      path: req.path,
      requestData: req.requestData,
      responseData: {
        statusCode: req.responseData.statusCode,
        data: req.responseData.data || {},
        message: req.responseData.message || '',
      },
      outgoingTimestamp: endTimestamp,
      duration: calculateDuration(req.startTimestamp, endTimestamp) || null,
      status: getApiStatus(req.responseData.statusCode),
      ...additionalData,
    };
    await AuditLog.findByIdAndUpdate(req.auditLogId, logData);
    logger.info('Audit log updated in MongoDB with _id: %s', req.auditLogId);
  } catch (error) {
    logger.error('Error updating audit log in MongoDB: %s', error);
  }
};

const getApiStatus = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'success';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'failed';
  } else if (statusCode >= 100 && statusCode < 200) {
    return 'pending';
  } else {
    return 'unknown';
  }
};

const redactSensitiveInfo = (body) => {
  const redactedBody = { ...body };
  const sensitiveFields = [
    'email',
    'password',
    'confirmPassword',
    'phoneNumber',
  ];
  sensitiveFields.forEach((field) => {
    if (redactedBody[field]) {
      redactedBody[field] = 'REDACTED';
    }
  });
  return redactedBody;
};

const auditLogger = async (allowedRequestTypes, req, res, next) => {
  // Check if the current request's method is allowed to be logged
  if (
    !allowedRequestTypes?.includes('all') &&
    !allowedRequestTypes?.includes(`${req.method.toLowerCase()}`)
  ) {
    return next();
  }

  req.startTimestamp = new Date();
  req.requestData = {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  };
  await saveAuditLog(
    {
      timestamp: req.startTimestamp,
      method: req.method,
      path: req.path,
      requestData: req.requestData,
    },
    req
  );
  const originalSend = res.send;
  res.send = async function (body) {
    req.responseData = {
      statusCode: res.statusCode,
      data: body || {},
      message: res.statusMessage || '',
    };
    if (req.auditLogId) {
      await updateAuditLogData(req, new Date());
    }
    originalSend.call(this, body);
  };
  res.on('finish', async () => {
    if (req.auditLogId) {
      await updateAuditLogData(req, new Date());
    }
  });
  res.on('close', async () => {
    if (req.auditLogId && !res.finished && res.statusCode >= 400) {
      await updateAuditLogData(req, new Date(), {
        responseData: {
          statusCode: res.statusCode,
          data: {},
          message: 'API request failed or connection was closed prematurely',
        },
      });
    }
  });
  next();
};

module.exports = auditLogger;
