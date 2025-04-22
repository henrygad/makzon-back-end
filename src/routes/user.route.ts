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

const router = Router();

// Public user routes
router.get("/all", userValidatorQueries, getAllUsers);
router.get("/:userName", userValidatorParam, getSingleUser);

// Protected user routes
router.get("/", isAuthenticated, getAuthUser);
router.get("/:userName/stream/followers",
  userValidatorParam,
  isAuthenticated,
  streamUserFollowers
);
router.post("/save", savesUserValidator, isAuthenticated, editAuthUserSaves);
router.post("/follow", followUserValidator, isAuthenticated, editAuthUserFollowings);
router.patch(
  "/",
  editUserValidator,
  isAuthenticated,
  uploadMedia.single("avatar"),
  storeMediaToDB,
  editAuthUser
);
router.delete("/", deleteUserValidator, isAuthenticated, deleteAuthUser);

export default router;
