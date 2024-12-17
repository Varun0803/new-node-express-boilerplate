const authMessage = {
  // General Authentication Messages
  UNAUTHORIZED: 'Unauthorized: Please authenticate.',
  SESSION_EXPIRED: 'Session has expired. Please log in again.',
  FORBIDDEN: 'Forbidden: You do not have permission to access this resource.',
  INVALID_TOKEN: 'Invalid Token.',

  // User and Admin Management
  USER_NOT_FOUND: 'User not found.',
  USER_IS_DISABLED: 'User is disabled.',
  EMAIL_ALREADY_REGISTERED: 'Email is already registered.',
  USER_ALREADY_EXIST: 'User already exists.',
  USER_CREATED_SUCCESSFULLY: 'User created successfully.',
  USER_UPDATED_SUCCESSFULLY: 'User updated successfully.',
  USER_DELETED_SUCCESSFULLY: 'User deleted successfully.',
  USER_LOGGED_IN_SUCCESSFULLY: 'Logged in successfully.',
  USER_LOGGED_OUT_SUCCESSFULLY: 'Logout successfully',

  // Admin-Specific Messages
  ADMIN_LOGIN_REQUIRED: 'Admin access is required for this action.',
  ADMIN_NOT_AUTHORIZED: 'You are not authorized as an admin.',

  // Email and Password Authentication
  EMPTY_EMAIL: 'Email cannot be empty.',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed.',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully.',
  RESET_PASSWORD_FAILED: 'Failed to reset password.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  VERIFICATION_EMAIL_SENT_SUCCESSFULLY: 'Verification email sent successfully.',

  // Miscellaneous
  TOKEN_REFRESHED_SUCCESSFULLY: 'Token refreshed successfully.',
  ACCOUNT_CREATED_SUCCESSFULLY: 'Account created successfully.',
  PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully.',
  PASSWORD_RESET_SUCCESSFULLY: 'Password reset successfully.',
  PASSWORD_RESET_SENT_SUCCESSFULLY: 'Password reset email sent successfully.',
};

module.exports = {
  authMessage,
};
