"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeHtmlEntities = exports.decodeHtmlEntities = void 0;
const he_1 = __importDefault(require("he"));
const decodeHtmlEntities = (text) => {
    return he_1.default.decode(text);
};
exports.decodeHtmlEntities = decodeHtmlEntities;
const encodeHtmlEntities = (text) => {
    return he_1.default.encode(text);
};
exports.encodeHtmlEntities = encodeHtmlEntities;
