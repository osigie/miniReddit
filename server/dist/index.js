"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const path_1 = __importDefault(require("path"));
const Updoot_1 = require("./entities/Updoot");
const app = (0, express_1.default)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "12345",
    database: "minireddit3",
    entities: [User_1.User, Post_1.Post, Updoot_1.Updoot],
    synchronize: true,
    logging: true,
    migrations: [path_1.default.join(__dirname, "./migrations/*.ts")],
});
const initializer = () => __awaiter(void 0, void 0, void 0, function* () {
    exports.AppDataSource.initialize()
        .then(() => {
        console.log("Data Source has been initialized!");
    })
        .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default();
    app.set("trust proxy", process.env.NODE_ENV !== "production");
    app.use((0, cors_1.default)({
        origin: ["https://studio.apollographql.com", "http://localhost:3000"],
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({ client: redis, disableTouch: false }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 5,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: "lax",
        },
        saveUninitialized: false,
        secret: "kjsxfksjifhisufhsjkdhfsdhfioshf",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        csrfPrevention: true,
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(3500, () => {
        console.log("server listening on port 3500");
    });
});
initializer().catch((e) => console.log(e, "an error occurred"));
//# sourceMappingURL=index.js.map