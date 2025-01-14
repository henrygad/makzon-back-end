"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Function to genenerate unique otp
const OTP = (num) => {
    let otp = "";
    const characters = "P1r3Z5q7i9";
    const bytes = crypto_1.default.randomBytes(num);
    for (let i = 0; i < num; i++) {
        otp += characters[bytes[i] % characters.length];
    }
    return otp;
};
exports.OTP = OTP;
exports.default = exports.OTP;
