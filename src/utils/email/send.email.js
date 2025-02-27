import nodemailer from "nodemailer";

export const sendEmail = async ({
  to = [], // list of receivers
  cc = [],
  bcc = [],
  subject = "Job Search App",
  text = "",
  html = "",
  attachments = [],
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  try {
    const email = await transporter.sendMail({
      from: `"Job Search App" <${process.env.EMAIL}>`, // sender address
      to, // list of receivers
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
    });
    console.log("Message sent: %s", email.messageId);
  } catch (error) {
    console.log(error);
  }
};
