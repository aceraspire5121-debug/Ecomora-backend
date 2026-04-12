import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log("Email sent");
  } catch (error) {
    console.log("Email error:", error.message);
  }
};

export default sendEmail;