const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
};

const getTransport = () => {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send parent verification email with link to approve teen account
 * @param {string} parentEmail
 * @param {string} teenName
 * @param {string} verifyUrl
 * @returns {Promise<boolean>} true if sent, false if not configured or failed
 */
exports.sendParentVerificationEmail = async (parentEmail, teenName, verifyUrl) => {
  if (!isEmailConfigured()) return false;
  const transport = getTransport();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'AfterBell <noreply@afterbell.com>',
      to: parentEmail,
      subject: `Approve ${teenName}'s AfterBell account`,
      text: `${teenName} has signed up for AfterBell and listed you as their parent. Please approve their account by clicking this link (valid for 24 hours):\n\n${verifyUrl}\n\nIf you didn't expect this, you can ignore this email.`,
      html: `
        <p>${teenName} has signed up for AfterBell and listed you as their parent.</p>
        <p>Please approve their account by clicking the link below (valid for 24 hours):</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#50C878;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Approve account</a></p>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>If you didn't expect this, you can ignore this email.</p>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

/**
 * Send a general notification email
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} text - plain text body
 * @param {string} html - HTML body (optional)
 * @returns {Promise<boolean>}
 */
exports.sendNotificationEmail = async (to, subject, text, html) => {
  if (!isEmailConfigured()) return false;
  const transport = getTransport();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'AfterBell <noreply@afterbell.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};
