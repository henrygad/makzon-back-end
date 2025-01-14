"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Base api route
router.get("/", (req, res) => {
    if (!req.session.visited) {
        // Modify session
        req.session.visited = true;
        req.session.save();
    }
    res.status(200).json({
        message: `Welcome ${req.session.visited ? "back" : "new"} user`,
        data: {
            session: req.session,
            sessionId: req.session.id,
        },
        success: true,
    });
});
exports.default = router;
