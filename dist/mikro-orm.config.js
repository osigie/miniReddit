"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        glob: "!(*.d).{js}",
    },
    entities: [Post_1.Post, User_1.User],
    type: "postgresql",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345",
    dbName: "minireddit",
    debug: !constants_1.__prod__,
};
//# sourceMappingURL=mikro-orm.config.js.map