const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
// const cron = require('node-cron');
// const { User } = require('../models');
// const MealPlan = require('../models/dietPlan.model');

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body
 * @returns {Promise} - Resolves with the result of the sendMail operation
 */

const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.from, to, subject, text, html };
  try {
    return await transport.sendMail(msg);
  } catch (error) {
    throw error;
  }
};

const sendDirectEmail = async (to, meal) => {
  const subject = 'Meal Reminder';
  const text = `It's time for your ${meal.name} at ${meal.time}.`;
  const html = `
    <h2>Meal Reminder</h2>
    <p>It's time for your <strong>${meal.name}</strong> at <strong>${meal.time}</strong>.</p>
    <p>Meal details: <strong>${meal.description}</strong></p>
    <p>Stay healthy and enjoy your meal!</p>
  `;
  return sendEmail(to, subject, text, html);
};

const sendResetPasswordEmail = async (to, resetPasswordToken) => {
  const subject = 'Reset Password';
  const text = `Please click the following link to reset your password: ${config.baseFrontendUrl}/reset-password?token=${resetPasswordToken}`;
  const html = `
    <p>Please click the following link to reset your password:</p>
    <a href="${config.baseFrontendUrl}/reset-password?token=${resetPasswordToken}">Reset Password</a>
  `;
  return sendEmail(to, subject, text, html);
};

const sendVerificationEmail = async (to, verificationToken) => {
  const subject = 'Email Verification';
  const text = `Please click the following link to verify your email: ${config.baseBackendUrl}/verify-email?token=${verificationToken}`;
  const html = `
    <p>Please click the following link to verify your email:</p>
    <a href="${config.baseBackendUrl}/verify-email?token=${verificationToken}">Verify Email</a>
  `;
  return sendEmail(to, subject, text, html);
};

// cron.schedule('* * * * *', async () => {
//   try {
//     const currentTime = new Date().toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });

//     const currentDay = new Date()
//       .toLocaleString('en-us', { weekday: 'long' })
//       .toLowerCase();

//     const dietPlans = await MealPlan.find();

//     dietPlans.forEach(async (plan) => {
//       const mealsForToday = plan.daily_meal_plan[currentDay].meals;

//       const userData = await User.findById(plan.userId);
//       if (!userData) {
//         console.log(`User with ID ${plan.userId} not found`);
//       }
//       // Iterate through meals (e.g., breakfast, lunch, dinner, snack_1, etc.)
//       for (const [mealType, mealDetails] of Object.entries(mealsForToday)) {
//         const [mealName, mealTime] = mealDetails; // Destructure to get meal name and time

//         if (mealTime === currentTime && userData.isEmailSubscribed === true) {
//           const meal = {
//             name: mealType,
//             time: mealTime,
//             description: mealName,
//           };
//           sendDirectEmail(userData.email, meal)
//             .then(() => {
//               console.log(`Reminder sent for ${meal.name} at ${meal.time}`);
//             })
//             .catch((error) => {
//               console.error(`Error sending ${meal.name} reminder:`, error);
//             });
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching diet plans or sending emails', error);
//   }
// });

module.exports = {
  sendEmail,
  sendDirectEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
