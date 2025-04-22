import { Router } from "express";
import {
  addPost,
  deletePost,
  editPost,
  getPosts,
  getSavePosts,
  getPost,
  getTimelinePosts,
  getTrendingPosts,
  streamTimelinePosts,
  partialEditPost,
  getUserPosts,
} from "../controllers/post.controllers";
import {
  addPostValidator,
  editPostValidator,
  getPostsValidator,
  validatePostId,
  validatePostParam,
  validatePostQueries,
} from "../validators/post.validator";
import { isAuthenticated } from "../middlewares/auth.middleware";
import uploadMedia, { storeMediaToDB } from "../middlewares/uploadMedia.config";

const router = Router();

// Public post routes
router.get("/", getPostsValidator, getPosts);
router.get("/trending", validatePostQueries, getTrendingPosts);
router.get("/:author/:slug", validatePostParam, getPost);

// Protected post routes
router.get("/user", validatePostQueries, isAuthenticated, getUserPosts);
router.get("/saves", validatePostQueries, isAuthenticated, getSavePosts);
router.get("/user/get/timeline", validatePostQueries, isAuthenticated, getTimelinePosts);
router.get("/user/get/stream/timeline", isAuthenticated, streamTimelinePosts);
router.post("/", addPostValidator, isAuthenticated, uploadMedia.single("post"), storeMediaToDB, addPost);
router.patch("/:id", editPostValidator, isAuthenticated, uploadMedia.single("post"), storeMediaToDB, editPost);
router.patch("/partial/:id", editPostValidator, isAuthenticated, partialEditPost);
router.delete("/:id", validatePostId, isAuthenticated, deletePost);                                                                                                                                                                                                                         

export default router;
