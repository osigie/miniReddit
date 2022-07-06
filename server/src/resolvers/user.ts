import { Post } from "../entities/Post";
import { MyContext } from "src/types/types";
import argon2, { hash } from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";
import { UserDetails } from "../types/UserDetails";
import { validateRegister } from "../utils/validateRegister";

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
  @Mutation(() => UserResponse)
  async register(
    @Arg("details") details: UserDetails,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(details);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(details.password);
    const user = em.create(User, {
      username: details.username,
      password: hashedPassword,
      email: details.email,
    });
    // let user;
    try {
      // const result = await (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({
      //     username: details.username,
      //     password: hashedPassword,
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   })
      //   .returning("*");
      // user = result[0];
      await em.persistAndFlush(user);
    } catch (error) {
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
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { username: usernameOrEmail }
        : { email: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [{ field: "username", message: "User not found" }],
      };
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [{ field: "username", message: "Invalid credentials" }],
      };
    }
    req.session.userId = user._id;

    return { user };
  }
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { _id: req.session.userId });
    return user;
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }
}
