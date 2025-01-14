"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMedia_config_1 = __importDefault(require("../config/uploadMedia.config"));
const file_controllers_1 = require("../controllers/file.controllers");
const file_validator_1 = require("../validators/file.validator");
const router = (0, express_1.Router)();
// All File route 
router.get("/?fieldname", file_validator_1.fileValidate_query, file_controllers_1.sendFilesInfo);
router.get("/:fieldname/:filename", file_validator_1.fileValidate_param, file_controllers_1.sendFile);
router.delete("/:folder/:filename", file_validator_1.fileValidate_param, file_controllers_1.deleteFile);
router.post("/image", uploadMedia_config_1.default.array("images", 10), file_controllers_1.uploadFile); // Images
router.post("/video", uploadMedia_config_1.default.single("videos"), file_controllers_1.uploadFile); // Vidoes
router.post("/audio", uploadMedia_config_1.default.single("audios"), file_controllers_1.uploadFile); // Audio
router.post("/doc", uploadMedia_config_1.default.single("docs"), file_controllers_1.uploadFile); // Docs
router.post("/ebook", uploadMedia_config_1.default.single("ebooks"), file_controllers_1.uploadFile); // Ebooks
router.post("/archive", uploadMedia_config_1.default.single("archives"), file_controllers_1.uploadFile); // Archives
exports.default = router;
