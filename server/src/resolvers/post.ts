import { title } from "process";
import { MyContext } from "../types/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class UserInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ _id: id });
  }
  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Arg("input") input: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    if (!req.session.userId) {
      return null
    }
    const post = new Post();
    post.title = input.title;
    post.text = input.text;
    post.creatorId = req.session.userId;
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
      Post.update({ _id: id }, { title: title });
    }
    return post;
  }
  @Mutation(() => String, { nullable: true })
  async deletePost(@Arg("id") id: number): Promise<String | null> {
    await Post.delete({ _id: id });
    return "succesfully deleted";
  }
}
