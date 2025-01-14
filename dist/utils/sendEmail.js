"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ emailTo, subject, template }) {
    const mailOptions = {
        from: `<${process.env.GMAIL}>`,
        to: emailTo,
        subject: subject,
        html: template,
    };
    let result = null;
    try {
        result = yield transporter.sendMail(mailOptions);
        return { sent: true, result };
    }
    catch (error) {
        return { sent: false, result: error };
    }
});
exports.default = sendEmail;
