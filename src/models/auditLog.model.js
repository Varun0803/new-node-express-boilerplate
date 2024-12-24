const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  outgoingTimestamp: {
    type: Date,
    default: null,
  },
  duration: {
    type: String,
    default: '',
  },
  method: {
    type: String,
    default: '',
  },
  path: {
    type: String,
    default: '',
  },
  requestData: {
    body: {
      type: Object,
      default: {},
    },
    query: {
      type: Object,
      default: {},
    },
    params: {
      type: Object,
      default: {},
    },
    headers: {
      type: Object,
      default: {},
    },
    origin: {
      type: String,
      default: '',
    },
  },
  responseData: {
    statusCode: {
      type: Number,
      default: 0,
    },
    data: {
      type: Object,
      default: {},
    },
    message: {
      type: String,
      default: '',
    },
  },
  status: {
    type: String,
    default: 'unknown',
  },
  errorStack: {
    type: String,
    default: '',
  },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema, 'auditLogs');

module.exports = AuditLog;
