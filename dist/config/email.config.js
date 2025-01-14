"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.GMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendEmail = async ({ emailTo, subject, template }) => {
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
    }
    catch (error) {
        return { sent: false, result: error };
    }
};
exports.default = sendEmail;
