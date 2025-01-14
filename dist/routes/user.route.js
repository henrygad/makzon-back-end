"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const users_validator_1 = require("../validators/users.validator");
const uploadMedia_config_1 = __importDefault(require("../config/uploadMedia.config"));
const auth_route_1 = __importDefault(require("./auth.route"));
const route = (0, express_1.Router)();
// Public user routes
route.get("/all", users_validator_1.userValidatorQueries, user_controllers_1.getAllUsers);
route.get("/:userName", users_validator_1.userValidatorParam, user_controllers_1.getSingleUser);
// Protected user routes
route.get("/", auth_middleware_1.isAuthenticated, user_controllers_1.getAuthUser);
route.delete("/", auth_middleware_1.isAuthenticated, users_validator_1.deleteUserValidator, user_controllers_1.deleteAuthUser);
route.post("/saves", auth_middleware_1.isAuthenticated, users_validator_1.savesUserValidator, user_controllers_1.editAuthUserSaves);
auth_route_1.default.post("/follow", auth_middleware_1.isAuthenticated, users_validator_1.followUserValidator, user_controllers_1.editAuthUserFollowings);
route.patch("/", auth_middleware_1.isAuthenticated, users_validator_1.editUserValidator, uploadMedia_config_1.default.single("avatar"), user_controllers_1.editAuthUser);
auth_route_1.default.use("/:userName/stream/followers", auth_middleware_1.isAuthenticated, users_validator_1.userValidatorParam, user_controllers_1.streamUserFollowers);
exports.default = route;
