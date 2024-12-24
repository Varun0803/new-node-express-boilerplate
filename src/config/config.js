const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description(
      'the from field in the emails sent by the app'
    ),
    BASE_BACKEND_URL: Joi.string().description('base backend url'),
    BASE_FRONTEND_URL: Joi.string().description('base frontend url'),
    ALLOWED_ORIGINS: Joi.string().description('allowed origins'),
    LOGGER_ENABLE: Joi.boolean().description('enable logger'),
    ALLOWED_REQUEST_TYPES_TO_LOG: Joi.string()
      .default('all')
      .description('allowed request types'),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(50),
    RATE_LIMIT_TIME: Joi.number().default(60000),
    DEFAULT_ADMIN_NAME: Joi.string().required(),
    DEFAULT_ADMIN_EMAIL: Joi.string().required(),
    DEFAULT_ADMIN_PASSWORD: Joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {},
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  baseBackendUrl: envVars.BASE_BACKEND_URL,
  baseFrontendUrl: envVars.BASE_FRONTEND_URL,
  allowedOrigins: envVars.ALLOWED_ORIGINS,
  logger: {
    enable: envVars.LOGGER_ENABLE,
    allowedRequestTypes: envVars.ALLOWED_REQUEST_TYPES_TO_LOG,
  },
  rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  rateLimitTime: envVars.RATE_LIMIT_TIME,
  defaultAdmin: {
    name: envVars.DEFAULT_ADMIN_NAME,
    email: envVars.DEFAULT_ADMIN_EMAIL,
    password: envVars.DEFAULT_ADMIN_PASSWORD,
  },
};
