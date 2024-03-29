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
import { Updoot } from "../entities/Updoot";

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

    const updoots = await Updoot.findOne({
      where: { postId, creatorId: userId },
    });

    ///they have voted before and are changing their vote count
    if (updoots && updoots.vote_point !== realValue) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `UPDATE updoot set vote_point = $1 where "postId" = $2 and "creatorId" = $3`,
          [realValue, postId, userId]
        );

        await tm.query(
          `
        UPDATE post SET points = points + $1 WHERE _id = $2`,
          [2 * realValue, postId]
        );
      });
    } else if (!updoots) {
      //the user have not voted before
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `INSERT INTO updoot ("postId", "creatorId", vote_point) VALUES ($1, $2, $3)`,
          [postId, userId, realValue]
        );
        await tm.query(
          `
        UPDATE post SET points = points + $1 WHERE _id = $2`,
          [realValue, postId]
        );
      });
    }
    // const vote = await AppDataSource.query(
    //   `START TRANSACTION;

    //   insert into updoot ("creatorId", "postId", vote_point)
    //    values (${userId}, ${postId}, ${realValue});

    //   update post
    //   set points = points + ${realValue}
    //   where _id = ${postId};
    //   COMMIT;
    //   `
    // );
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int, { nullable: true }) limit: number,
    @Ctx() { req }: MyContext,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlus = realLimit + 1;

    const replacements: any[] = [realLimitPlus];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIndx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIndx = replacements.length;
    }
    const posts = await AppDataSource.query(
      `SELECT p.*, 
      json_build_object(
        '_id', u._id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
         'updatedAt', u."updatedAt"
      ) creator,
      ${
        req.session.userId
          ? '(select vote_point from updoot where "creatorId" = $2 and "postId" = p._id) "voteStatus"'
          : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u._id = p."creatorId"
      ${cursor ? `WHERE p."createdAt"   < $${cursorIndx}` : ""}
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
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    // const post = await Post.findOne({ where: { _id: id } });
    const replacement = [id];
    const post = await AppDataSource.query(
      `
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
    `,
      replacement
    );
    return post[0];
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
  @UseMiddleware(authentication)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
    @Arg("text", () => String) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const userId = req.session.userId;
    const post = await AppDataSource.createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('_id = :id and "creatorId" = :userId', { id, userId })
      .returning("*")
      .execute();

    return post.raw[0];
  }

  @Mutation(() => String, { nullable: true })
  @UseMiddleware(authentication)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<String | null> {
    const post = await Post.findOne({ where: { _id: id } });
    if (!post) {
      return "post not found";
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("User is not authorized");
    }

    await Post.delete({ _id: id, creatorId: req.session.userId });
    return "succesfully deleted";
  }
}
