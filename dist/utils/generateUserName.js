"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generatedUserName = (name) => {
    // Generate random username
    const getName = name.trim().replace(/\s/g, "");
    const loop = getName.length;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let userName = getName + "_";
    for (let i = 0; i < loop; i++) {
        const randomNumber = Math.floor(Math.random() * characters.length);
        userName += characters[randomNumber];
    }
    return userName;
};
exports.default = generatedUserName;
