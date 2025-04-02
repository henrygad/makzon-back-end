import { Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  getAuthUser,
  editAuthUser,
  deleteAuthUser,
  editAuthUserSaves,
  streamUserFollowers,
  editAuthUserFollowings,
} from "../controllers/user.controllers";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  deleteUserValidator,
  editUserValidator,
  userValidatorQueries,
  userValidatorParam,
  savesUserValidator,
  followUserValidator,
} from "../validators/users.validator";
import upload from "../config/uploadMedia.config";
import router from "./auth.route";

const route = Router();

// Public user routes
route.get("/all", userValidatorQueries, getAllUsers);
route.get("/:userName", userValidatorParam, getSingleUser);

// Protected user routes
route.get("/", isAuthenticated, getAuthUser);
route.delete("/", isAuthenticated, deleteUserValidator, deleteAuthUser);
route.post("/saves", isAuthenticated, savesUserValidator, editAuthUserSaves);
router.post(
  "/follow",
  isAuthenticated,
  followUserValidator,
  editAuthUserFollowings
);
route.patch(
  "/",
  isAuthenticated,
  editUserValidator,
  upload.single("avatar"),
  editAuthUser
);
router.get(
  "/:userName/stream/followers",
  isAuthenticated,
  userValidatorParam,
  streamUserFollowers
);

export default route;
