import { Router } from "express";
import { deleteUserData, updateUserData, sendUserData } from "../controllers/user.controllers";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { userValidate_body_delete, userValidate_body_update } from "../validators/users.validator";
import upload from "../config/uploadMedia.config";

const route = Router();

// User routes
route.get("/", isAuthenticated, sendUserData);
route.patch("/", isAuthenticated, userValidate_body_update, upload.single("avatar"), updateUserData);
route.delete("/", isAuthenticated, userValidate_body_delete, deleteUserData);

export default route;
