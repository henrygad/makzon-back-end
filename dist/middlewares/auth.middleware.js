"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const error_1 = __importDefault(require("../utils/error"));
// Authenticate user middleware
const isAuthenticated = (req, _res, next) => {
    try {
        if (req.isAuthenticated() && // Auth from server
            req.user.sessions.some(value => value.token === req.session.id && value.toExpire > Date.now()) // Auth from db
        ) {
            next();
        }
        else {
            (0, error_1.default)({ statusCode: 401, message: "Unauthorized" });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthenticated = isAuthenticated;
