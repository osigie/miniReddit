import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

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
  async createPost(@Arg("title") title: string): Promise<Post | null> {
    const post = new Post();
    post.title = title;
console.log("this is what i want ooo.....", await post.save())
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
