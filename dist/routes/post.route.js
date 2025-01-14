"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const post_controllers_1 = require("../controllers/post.controllers");
const post_validator_1 = require("../validators/post.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public post routes
router.get("/", post_validator_1.getPostsValidator, post_controllers_1.getPosts);
router.get("/:id", post_validator_1.validatePostParam, post_controllers_1.getPost);
router.get("/treading", post_validator_1.validatePostQueries, post_controllers_1.getTrendingPosts);
// Protected post routes
router.post("/", post_validator_1.addPostValidator, auth_middleware_1.isAuthenticated, post_controllers_1.addPost);
router.patch("/:id", post_validator_1.editPostValidator, auth_middleware_1.isAuthenticated, post_controllers_1.editPost);
router.delete("/:id", post_validator_1.validatePostParam, auth_middleware_1.isAuthenticated, post_controllers_1.deletePost);
router.get("/saves", post_validator_1.validatePostQueries, auth_middleware_1.isAuthenticated, post_controllers_1.getSavePosts);
router.get("/timeline", post_validator_1.validatePostQueries, auth_middleware_1.isAuthenticated, post_controllers_1.getTimelinePosts);
router.get("/timeline/stream", auth_middleware_1.isAuthenticated, post_controllers_1.streamTimelinePosts);
exports.default = router;
