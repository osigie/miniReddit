import { MyContext } from "../types/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { authentication } from "../middleware/authentication";
import { AppDataSource } from "../index";
import { User } from "../entities/User";

@InputType()
class UserInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field(() => Boolean)
  more: Boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() post: Post) {
    return post.text.substring(0, 100);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlus = realLimit + 1;
    const posts = AppDataSource.getRepository(Post)
      .createQueryBuilder("post")
      .orderBy("post.createdAt", "DESC")
      .take(realLimitPlus);
    if (cursor) {
      posts.where("post.createdAt < :cursor", {
        cursor,
      });
    }
    const actualPost = (await posts.getMany()).slice(0, realLimit);
    const hasMore = actualPost.length === realLimitPlus;
    return { posts: actualPost, more: hasMore };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ _id: id });
  }
  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(authentication)
  async createPost(
    @Arg("input") input: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = Post.create({
      ...input,
      creatorId: req.session.userId,
    });
    return await post.save();
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ _id: id });
    if (!post) {
      throw new Error("Post not found");
    }
    if (typeof title !== "undefined") {
      await Post.update({ _id: id }, { title: title });
    }
    return post;
  }
  @Mutation(() => String, { nullable: true })
  async deletePost(@Arg("id") id: number): Promise<String | null> {
    await Post.delete({ _id: id });
    return "succesfully deleted";
  }
}
