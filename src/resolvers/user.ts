import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import argon2, { hash } from "argon2";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
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

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("details") details: UserDetails,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon2.hash(details.password);
    const user = em.create(User, {
      username: details.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg("details") details: UserDetails,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: details.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "User not found" }],
      };
    }

    const validPassword = await argon2.verify(user.password, details.password);
    if (!validPassword) {
      return {
        errors: [{ field: "null", message: "Invalid credentials" }],
      };
    }
    return { user };
  }
}
