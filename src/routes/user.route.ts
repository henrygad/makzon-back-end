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
import uploadMedia, { storeMediaToDB } from "../middlewares/uploadMedia.config";
import router from "./auth.route";

const route = Router();

// Public user routes
route.get("/all", userValidatorQueries, getAllUsers);
route.get("/:userName", userValidatorParam, getSingleUser);

// Protected user routes
route.get("/", isAuthenticated, getAuthUser);
router.get(
  "/:userName/stream/followers",
  userValidatorParam,
  isAuthenticated,
  streamUserFollowers
);
route.post("/save", savesUserValidator, isAuthenticated, editAuthUserSaves);
router.post( "/follow",
  followUserValidator,
  isAuthenticated,
  editAuthUserFollowings
);
route.patch(
  "/",
  editUserValidator,
  isAuthenticated,
  uploadMedia.single("avatar"),
  storeMediaToDB,
  editAuthUser
);
route.delete("/", deleteUserValidator, isAuthenticated, deleteAuthUser);

export default route;
