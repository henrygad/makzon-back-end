"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_1 = __importDefault(require("../utils/error"));
const OTP_1 = __importDefault(require("../utils/OTP"));
const email_config_1 = __importDefault(require("../config/email.config"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.get("/home", (_req, res, next) => {
    const filePath = path_1.default.join(__dirname, "..", "public", "home.html");
    if (!fs_1.default.existsSync(filePath))
        (0, error_1.default)({ statusCode: 404, message: "Page not found" });
    fs_1.default.readFile(filePath, "utf-8", (err, file) => {
        if (err)
            next((0, error_1.default)({ statusCode: 500, message: "Failed to read index.html file" }));
        const dynamicFile = file
            .replace("{{name}}", "Henry gad")
            .replace("{{role}}", "Developer");
        res.header("Content-Type", "text/html");
        res.status(200).send(dynamicFile);
    });
}); // Base end point
router.get("/email", async (_, res, next) => {
    try {
        // Generate OTP token and send a welcome email to user along the otp to verify account
        const otp = (0, OTP_1.default)(4);
        const email = "henrygad.orji@gmail.com";
        const url = process.env.DOMAIN_NAME + `/api/auth/verify?otp=${otp}`;
        const result = await (0, email_config_1.default)({
            emailTo: email,
            subject: "Email Verification",
            template: `Welcome Henry Loveday. Your verification code is: ${otp}. or click this url ${url}`,
        });
        if (!result.sent)
            (0, error_1.default)({ statusCode: 500, message: "Failed to send email" });
        res.status(200).json({
            message: "OTP token has been sent to your mail box",
        });
    }
    catch (error) {
        next(error);
    }
});
// html streaming
router.get("/", (_, res, next) => {
    const filePath = path_1.default.join(__dirname, "..", "public", "text.txt");
    if (!fs_1.default.existsSync(filePath))
        next((0, error_1.default)({ statusCode: 404, message: "Page not found" }));
    const readAbleStreams = fs_1.default.createReadStream(filePath);
    res.header("Content-Type", "text/plain");
    readAbleStreams.pipe(res);
    readAbleStreams.on("start", () => {
        console.log("streaming started");
    });
    readAbleStreams.on("data", () => {
        console.log("still streaming");
    });
    readAbleStreams.on("end", () => {
        console.log("streaming finishd");
    });
    readAbleStreams.on("error", () => {
        console.log("error while streaming");
    });
});
exports.default = router;
/*

// Middleware to upload multipart form-data (files)
const uploadMedia = (fieldname: string, max: number, callback: (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[]; } | undefined) => void = () => null) => {
    return async (req: Request, res: Response, next: NextFunction) =>
        upload.array(fieldname, max)(req, res, async (err) => {
            try {
                if (err) {
                    // Check if File(s) exceeds the file size limit to accept
                    if (err.code === "LIMIT_FILE_SIZE") createError({ statusCode: 400, message: "File size is too large" });
                    createError({ statusCode: 400, message: "An error occurred!" });
                };

                // callback
                callback(req.files);

                res.status(201).json({
                    message: "File uploaded successfully",
                    files: req.files
                });
            } catch (error) {

                next(error);
            }

        });
};


*/ 
