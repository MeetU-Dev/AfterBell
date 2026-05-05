const twilio = require('twilio');

const hasTwilioConfig = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
};

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

exports.sendOtpSms = async (phone, otp) => {
  if (!hasTwilioConfig()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] ${phone}: ${otp}`);
      return { sent: false, devOtp: otp };
    }

    throw new Error('Twilio is not configured');
  }

  const client = getTwilioClient();
  await client.messages.create({
    body: `Your AfterBell verification code is ${otp}. It expires in 10 minutes.`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });

  return { sent: true };
};
