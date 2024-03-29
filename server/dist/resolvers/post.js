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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const authentication_1 = require("../middleware/authentication");
const index_1 = require("../index");
const User_1 = require("../entities/User");
const Updoot_1 = require("../entities/Updoot");
let UserInput = class UserInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UserInput.prototype, "text", void 0);
UserInput = __decorate([
    (0, type_graphql_1.InputType)()
], UserInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "more", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(post) {
        return post.text.substring(0, 100);
    }
    vote(postId, point, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const realValue = point !== -1 ? 1 : -1;
            const updoots = yield Updoot_1.Updoot.findOne({
                where: { postId, creatorId: userId },
            });
            if (updoots && updoots.vote_point !== realValue) {
                yield index_1.AppDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`UPDATE updoot set vote_point = $1 where "postId" = $2 and "creatorId" = $3`, [realValue, postId, userId]);
                    yield tm.query(`
        UPDATE post SET points = points + $1 WHERE _id = $2`, [2 * realValue, postId]);
                }));
            }
            else if (!updoots) {
                yield index_1.AppDataSource.transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                    yield tm.query(`INSERT INTO updoot ("postId", "creatorId", vote_point) VALUES ($1, $2, $3)`, [postId, userId, realValue]);
                    yield tm.query(`
        UPDATE post SET points = points + $1 WHERE _id = $2`, [realValue, postId]);
                }));
            }
            return true;
        });
    }
    posts(limit, { req }, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlus = realLimit + 1;
            const replacements = [realLimitPlus];
            if (req.session.userId) {
                replacements.push(req.session.userId);
            }
            let cursorIndx = 3;
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
                cursorIndx = replacements.length;
            }
            const posts = yield index_1.AppDataSource.query(`SELECT p.*, 
      json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
         'updatedAt', u."updatedAt"
      ) creator,
      ${req.session.userId
                ? '(select vote_point from updoot where "creatorId" = $2 and "postId" = p._id) "voteStatus"'
                : 'null as "voteStatus"'}
      from post p
      inner join public.user u on u._id = p."creatorId"
      ${cursor ? `WHERE p."createdAt"   < $${cursorIndx}` : ""}
      ORDER BY p."createdAt" DESC
      limit $1
      
      `, replacements);
            const actualPost = posts.slice(0, realLimit);
            const hasMore = posts.length === realLimitPlus;
            return { posts: actualPost, more: hasMore };
        });
    }
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const replacement = [id];
            const post = yield index_1.AppDataSource.query(`
    SELECT P.*,
       json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
         'updatedAt', u."updatedAt"
      ) creator
      FROM POST P
    INNER JOIN public.user u on u._id = p."creatorId"
 WHERE P._id = $1
    `, replacement);
            return post[0];
        });
    }
    createPost(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const user = yield User_1.User.findOneBy({ _id: userId });
            const post = Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId, creator: user }));
            return yield post.save();
        });
    }
    updatePost(id, title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const post = yield index_1.AppDataSource.createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('_id = :id and "creatorId" = :userId', { id, userId })
                .returning("*")
                .execute();
            return post.raw[0];
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne({ where: { _id: id } });
            if (!post) {
                return "post not found";
            }
            if (post.creatorId !== req.session.userId) {
                throw new Error("User is not authorized");
            }
            yield Post_1.Post.delete({ _id: id, creatorId: req.session.userId });
            return "succesfully deleted";
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("point", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int, { nullable: true })),
    __param(1, (0, type_graphql_1.Ctx)()),
    __param(2, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(authentication_1.authentication),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(authentication_1.authentication),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("title", () => String)),
    __param(2, (0, type_graphql_1.Arg)("text", () => String)),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => String, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(authentication_1.authentication),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map