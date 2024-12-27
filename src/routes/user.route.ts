import { Router } from "express";
import { deleteUserData, editUserData, sendUserData } from "../controllers/user.controllers";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { userValidate_body_delete, userValidate_body_update} from "../validators/users.validator";

const route = Router();

// User routes
route.get("/user", isAuthenticated, sendUserData);
route.patch("/user", isAuthenticated, userValidate_body_update, editUserData);
route.delete("/user", isAuthenticated, userValidate_body_delete, deleteUserData);

export default route;
