import nodemailer from "nodemailer";
import "dotenv/config";

type emailProps = {
  emailTo: string;
  subject: string;
  template: string;
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailResponse {
  sent: boolean;
  result: unknown;
}

const sendEmail = async ({ emailTo, subject, template }: emailProps): Promise<EmailResponse> => {
  const mailOptions = {
    from: `<${process.env.GMAIL}>`,
    to: emailTo,
    subject: subject,
    html: template,
  };

  let result = null;
  try {
    result = await transporter.sendMail(mailOptions);
    return { sent: true, result };
  } catch (error) {
    return { sent: false, result: error };
  }
};

export default sendEmail;
