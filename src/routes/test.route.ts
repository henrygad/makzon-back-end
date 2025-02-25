import { Router, Request, Response, NextFunction } from "express";
import createError from "../utils/error";
import OTP from "../utils/OTP";
import sendEmail from "../config/email.config";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/home", (_req: Request, res: Response, next: NextFunction) => {

  const filePath = path.join(__dirname, "..", "public", "home.html");
  if (!fs.existsSync(filePath)) createError({ statusCode: 404, message: "Page not found" });

  fs.readFile(filePath, "utf-8", (err, file) => {
    if (err) next(createError({ statusCode: 500, message: "Failed to read index.html file" }));
    const dynamicFile = file
      .replace("{{name}}", "Henry gad")
      .replace("{{role}}", "Developer");

    res.header("Content-Type", "text/html");
    res.status(200).send(dynamicFile);
  });
}); // Base end point


router.get("/email", async (_: Request, res: Response, next: NextFunction) => {
  try {
    // Generate OTP token and send a welcome email to user along the otp to verify account
    const otp = OTP(4);
    const email = "henrygad.orji@gmail.com";
    const url = process.env.DOMAIN_NAME + `/api/auth/verify?otp=${otp}`;
    const result = await sendEmail({
      emailTo: email,
      subject: "Email Verification",
      template: `Welcome Henry Loveday. Your verification code is: ${otp}. or click this url ${url}`,
    });

    if (!result.sent)
      createError({ statusCode: 500, message: "Failed to send email" });

    res.status(200).json({
      message: "OTP token has been sent to your mail box",
    });
  } catch (error) {
    next(error);
  }
});

// html streaming
router.get("/", (_: Request, res: Response, next: NextFunction) => {
  const filePath = path.join(__dirname, "..", "public", "text.txt");
  if (!fs.existsSync(filePath)) next(createError({ statusCode: 404, message: "Page not found" }));

  const readAbleStreams = fs.createReadStream(filePath);

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


export default router;


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