import EventEmitter from "events";
import { sendEmail } from "../email/send.email.js";
import { verificationEmailTemplate } from "../email/template/verification.email.js";
export const emailEvent = new EventEmitter();

export const subjectTypes = {
  CONFIRM_EMAIL: "Confirm Email",
  FORGET_PASSWORD: "Forget Password",
  EMAIL_UPDATED: "Email Updated Successfully",
  LOGIN_OTP: "Login OTP",
  APPLICATION_STATUS: "Application Status",
};
export const eventTypes = {
  SEND_CONFIRM_EMAIL: "sendConfirmEmail",
  FORGET_PASSWORD: "forgetPassword",
  EMAIL_UPDATED: "emailUpdated",
  LOGIN_OTP: "loginOTP",
  APPLICATION_STATUS: "applicationStatus",
};
const sendCode = async ({
  data = {},
  subject = subjectTypes.CONFIRM_EMAIL,
}) => {
  const { email, otp } = data;
  const html = verificationEmailTemplate({ activationCode: otp });
  await sendEmail({
    to: email,
    subject,
    html,
  });
};

emailEvent.on(eventTypes.SEND_CONFIRM_EMAIL, async (data) => {
  sendCode({ data });
});

emailEvent.on(eventTypes.FORGET_PASSWORD, async (data) => {
  sendCode({ data, subject: subjectTypes.FORGET_PASSWORD });
});

emailEvent.on(eventTypes.EMAIL_UPDATED, async (data) => {
  sendCode({
    data: { email: data.email, otp: "Email Updated Successfully" },
    subject: subjectTypes.EMAIL_UPDATED,
  });
});

emailEvent.on(eventTypes.LOGIN_OTP, async (data) => {
  sendCode({ data, subject: subjectTypes.LOGIN_OTP });
});

emailEvent.on(eventTypes.APPLICATION_STATUS, async (data) => {
  const { email, applicationStatus, companyName, jobTitle } = data;
  await sendEmail({
    to: email,
    subject: `${subjectTypes.APPLICATION_STATUS} - ${companyName} - ${jobTitle}`,
    html: `
      <h1>Updated Application Status</h1>
      <p>Your application status is updated to ${applicationStatus}</p>
    `,
  });
});
