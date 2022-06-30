"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const orm = {
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        glob: "!(*.d).{js,ts}",
    },
    entities: [Post_1.Post],
    type: "postgresql",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345",
    dbName: "minireddit",
    debug: !constants_1.__prod__,
};
exports.default = orm;
//# sourceMappingURL=mikro-orm.config.js.map