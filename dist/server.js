"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
require("dotenv/config");
const db_config_1 = __importDefault(require("./config/db.config"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const PORT = process.env.PORT || 5000;
(0, db_config_1.default)(() => {
    if (process.env.NODE_ENV === "production") {
        const options = {
            key: fs_1.default.readFileSync("./src/assets/certs/localhost-key.pem"),
            cert: fs_1.default.readFileSync("./src/assets/certs/localhost-cert.pem"),
        };
        https_1.default
            .createServer(options, app_1.default)
            .listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Server current running on domain name: ${process.env.DOMAIN_NAME}`);
        });
    }
    else {
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Server current running on domain name: ${process.env.DOMAIN_NAME}`);
        });
    }
});
