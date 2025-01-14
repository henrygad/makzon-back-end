"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const draft_controllers_1 = require("../controllers/draft.controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const post_validator_1 = require("../validators/post.validator");
const router = (0, express_1.Router)();
// Draft routes
router.get("/", auth_middleware_1.isAuthenticated, draft_controllers_1.getDrafts);
router.get("/:id", post_validator_1.validatePostParam, auth_middleware_1.isAuthenticated, draft_controllers_1.getDraft);
router.post("/", post_validator_1.addPostValidator, auth_middleware_1.isAuthenticated, draft_controllers_1.addDraft);
router.patch("/:id", post_validator_1.editPostValidator, auth_middleware_1.isAuthenticated, draft_controllers_1.editDraft);
router.delete("/:id", post_validator_1.validatePostParam, auth_middleware_1.isAuthenticated, draft_controllers_1.deleteDraft);
exports.default = router;
