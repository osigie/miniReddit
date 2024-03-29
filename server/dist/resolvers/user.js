"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const index_1 = require("../index");
const type_graphql_1 = require("type-graphql");
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const User_1 = require("../entities/User");
const UserDetails_1 = require("../types/UserDetails");
const sendMails_1 = __importDefault(require("../utils/sendMails"));
const validateRegister_1 = require("../utils/validateRegister");
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        return req.session.userId === user._id ? user.email : "";
    }
    register(details, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, validateRegister_1.validateRegister)(details);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2_1.default.hash(details.password);
            let user;
            try {
                const result = yield index_1.AppDataSource.createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values([
                    {
                        username: details.username,
                        password: hashedPassword,
                        email: details.email,
                    },
                ])
                    .returning("*")
                    .execute();
                user = result.raw[0];
            }
            catch (error) {
                if (error.code === "23505" || error.details.included("already exists")) {
                    return {
                        errors: [
                            {
                                field: "username",
                                message: "user already exists with that username",
                            },
                        ],
                    };
                }
            }
            req.session.userId = user._id;
            return { user };
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOneBy(usernameOrEmail.includes("@")
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail });
            if (!user) {
                return {
                    errors: [{ field: "usernameOrEmail", message: "User not found" }],
                };
            }
            const validPassword = yield argon2_1.default.verify(user.password, password);
            if (!validPassword) {
                return {
                    errors: [{ field: "usernameOrEmail", message: "Invalid credentials" }],
                };
            }
            req.session.userId = user._id;
            return { user };
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            return User_1.User.findOneBy({ _id: req.session.userId });
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
    forgotPassword({ redis }, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOneBy({ email });
            if (!user) {
                return false;
            }
            else {
                const token = (0, uuid_1.v4)();
                yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user._id);
                yield redis.expire(token, 1000 * 60 * 60 * 24 * 3);
                yield (0, sendMails_1.default)(email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`);
                return true;
            }
        });
    }
    newPassword(newPassword, token, { req, redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length < 5) {
                return {
                    errors: [
                        {
                            field: "newPassword",
                            message: "Password must be at least 5 characters long",
                        },
                    ],
                };
            }
            const userId = yield redis.get(constants_1.FORGET_PASSWORD_PREFIX + token);
            if (!userId) {
                return {
                    errors: [{ field: "token", message: "token expired" }],
                };
            }
            const userNum = Number(userId);
            const user = yield User_1.User.findOneBy({ _id: userNum });
            if (!user) {
                return {
                    errors: [{ field: "token", message: "user no longer exists" }],
                };
            }
            const hashedPassword = yield argon2_1.default.hash(newPassword);
            yield User_1.User.update({ _id: userNum }, { password: hashedPassword });
            yield redis.del(constants_1.FORGET_PASSWORD_PREFIX + token);
            req.session.userId = user._id;
            return { user };
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("details")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserDetails_1.UserDetails, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("usernameOrEmail")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("email")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("newPassword")),
    __param(1, (0, type_graphql_1.Arg)("token")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "newPassword", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map