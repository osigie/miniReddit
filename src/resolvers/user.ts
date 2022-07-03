import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import argon2, { hash } from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";

@InputType()
class UserDetails {
  @Field()
  password: string;
  @Field()
  username: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("details") details: UserDetails,
    @Ctx() { em }: MyContext
  ) {
    // try {
    //     const hashedPassword = await argon2.hash(details.password);
    // } catch (err) {
    //   //...
    // }

    const hashedPassword = await argon2.hash(details.password);
    const user = em.create(User, {
      username: details.username,
      password: details.username,
    });
    await em.persistAndFlush(user);
    return user;
  }
}
