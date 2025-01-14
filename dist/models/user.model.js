"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
;
const UserSchema = new mongoose_1.Schema({
    userName: {
        type: String,
        require: [true, "Please provide a username"],
        unique: [true, "This username is not avalible"],
    },
    email: {
        type: String,
        require: [true, "Please provide an email"],
        unique: [true, "There is an  account with this email"],
    },
    password: {
        type: String,
        require: [true, "Please provide a password"],
    },
    googleId: String,
    userVerified: {
        type: Boolean,
        default: false,
    },
    sessions: [
        {
            token: String,
            toExpire: Number
        }
    ],
    verificationToken: String,
    verificationTokenExpiringdate: Number,
    changeEmailVerificationToken: String,
    changeEmailVerificationTokenExpiringdate: Number,
    requestChangeEmail: String,
    forgetPassWordToken: String,
    forgetPassWordTokenExpiringdate: Number,
    avatar: String,
    name: { familyName: String, givenName: String },
    dateOfBirth: String,
    displayDateOfBirth: {
        type: Boolean,
        default: false
    },
    displayEmail: String,
    displayPhoneNumber: String,
    website: String,
    profession: [String],
    country: String,
    sex: String,
    bio: {
        type: String,
        max: [50, "Words have exceded 50 words"],
    },
    followings: [String],
    followers: [String],
    timeline: [String],
    saves: [String],
}, { timestamps: true });
// On save doc
UserSchema.pre("save", async function (next) {
    // Hash password
    if (this.isModified("password")) {
        this.password = await bcryptjs_1.default.hash(this.password, 12);
    }
    // Set followings to timeline
    if (this.isModified("followings")) {
        this.timeline = this.followings;
    }
    next();
});
// Compare password
UserSchema.methods.isValidPassword = async function (password) {
    const isMatch = await bcryptjs_1.default.compare(password, this.password);
    return isMatch;
};
const Users = mongoose_1.default.models.users || mongoose_1.default.model("users", UserSchema);
exports.default = Users;
