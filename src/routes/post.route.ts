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
} from "../controllers/post.controllers";
import {
  addPostValidator,
  editPostValidator,
  getPostsValidator,
  validatePostParam,
  validatePostQueries,
} from "../validators/post.validator";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

// Public post routes
router.get("/", getPostsValidator, getPosts);
router.get("/:id", validatePostParam, getPost);
router.get("/treading", validatePostQueries, getTrendingPosts);

// Protected post routes
router.post("/", addPostValidator, isAuthenticated, addPost);
router.patch("/:id", editPostValidator, isAuthenticated, editPost);
router.delete("/:id", validatePostParam, isAuthenticated, deletePost);                                                                                                                                                                                                                         
router.get("/saves", validatePostQueries, isAuthenticated, getSavePosts);
router.get("/timeline", validatePostQueries, isAuthenticated, getTimelinePosts);
router.get("/timeline/stream", isAuthenticated, streamTimelinePosts);

export default router;
