import { Router } from "express";
import { addDraftPost, addPublishPost, deletePost, editPost, getPosts, getSavePosts, getSinglePost, getTimelinePosts, getTrendingPosts, streamTimelinePosts } from "../controllers/post.controllers";
import { addNewPostValidator, editPostValidator, getPostsValidator, validatePostParam, validatePostQueries } from "../validators/post.validator";

const router = Router();

// Public post routes
router.get("/", getPostsValidator, getPosts);
router.get("/:id", validatePostParam, getSinglePost);
router.get("/treading", validatePostQueries, getTrendingPosts);

// Protected post routes
router.patch("/:id", editPostValidator, editPost);
router.delete("/:id", validatePostParam, deletePost);
router.post("/draft", addNewPostValidator, addDraftPost);
router.post("/publish", addNewPostValidator, addPublishPost);
router.get("/saves", validatePostQueries, getSavePosts);
router.get("/timeline", validatePostQueries, getTimelinePosts);
router.get("/timeline/stream", streamTimelinePosts);

export default router;
