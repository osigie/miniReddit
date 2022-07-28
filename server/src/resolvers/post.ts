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

  @Mutation(() => Boolean)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("point", () => Int) point: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const userId = req.session.userId;
    const realValue = point !== -1 ? 1 : -1;
    // const user = await User.findOneBy({ _id: userId });
    // const post = await Post.findOneBy({ _id: id });
    // if (!post) {
    //   throw new Error("Post not found");
    // }
    // if (post.updoots.find((updoot) => updoot.userId === userId)) {
    //   throw new Error("Already voted");
    // }
    // post.updoots.push({ userId: userId, user: user as User });
    // await post.save();
    // return true;

    const vote = await AppDataSource.query(
      `START TRANSACTION;

      insert into updoot ("creatorId", "postId", vote_point)
       values (${userId}, ${postId}, ${realValue});

      update post 
      set points = points + ${realValue}
      where _id = ${postId};
      COMMIT;
      `
    );
    return true;
  }

  //   async unvote(@Arg("id") id: number, @Ctx() { req }: MyContext): Promise<Boolean> {
  //     const userId = req.session.userId;
  //     const user = await User.findOneBy({ _id: userId });
  //     const post = await Post.findOneBy({ _id: id });
  //     if (!post) {
  //       throw new Error("Post not found");
  //     }
  //     if (!post.updoots.find((updoot) => updoot.userId === userId)) {
  //       throw new Error("Already voted");
  //     }
  //     post.updoots = post.updoots.filter((updoot) => updoot.userId !== userId);
  //     await post.save();
  //     return true;
  //   }
  // }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlus = realLimit + 1;

    const replacements: any[] = [realLimitPlus];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const posts = await AppDataSource.query(
      `SELECT p.*, 
      json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
         'updatedAt', u."updatedAt"
      ) creator
      from post p
      inner join public.user u on u._id = p."creatorId"
      ${cursor ? `WHERE p."createdAt"   < $2` : ""}
      ORDER BY p."createdAt" DESC
      limit $1
      
      `,
      replacements
    );

    // getRepository(Post)
    //   .createQueryBuilder("post")
    //   .innerJoinAndSelect("post.creator", "creator._id = post.creatorId")
    //   .orderBy("post.createdAt", "DESC")
    //   .take(realLimitPlus);
    // if (cursor) {
    //   posts.where("post.createdAt < :cursor", {
    //     cursor,
    //   });
    // }
    // const actualPost = (await posts.getMany()).slice(0, realLimit);
    const actualPost = posts.slice(0, realLimit);
    const hasMore = posts.length === realLimitPlus;
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
    const userId = req.session.userId;
    const user = await User.findOneBy({ _id: userId });
    const post = Post.create({
      ...input,
      creatorId: req.session.userId,
      creator: user as User,
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
