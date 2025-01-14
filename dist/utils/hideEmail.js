"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hideEmail = (email) => {
    // Function to hide user email
    const [username, domain] = email.split("@");
    return `${username.slice(0, 3)}***@${domain}`;
};
exports.default = hideEmail;
