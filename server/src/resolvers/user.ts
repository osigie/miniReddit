import argon2 from "argon2";
import { AppDataSource } from "../index";
import { MyContext } from "src/types/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { UserDetails } from "../types/UserDetails";
import sendEmails from "../utils/sendMails";
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(details);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(details.password);
    let user;
    try {
      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(User)
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOneBy(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "User not found" }],
      };
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [{ field: "usernameOrEmail", message: "Invalid credentials" }],
      };
    }
    req.session.userId = user._id;

    return { user };
  }
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    return User.findOneBy({ _id: req.session.userId });
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
  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() { redis }: MyContext,
    @Arg("email") email: string
  ) {
    const user = await User.findOneBy({ email });
    if (!user) {
      return false;
    } else {
      const token = v4();
      await redis.set(FORGET_PASSWORD_PREFIX + token, user._id);
      await redis.expire(token, 1000 * 60 * 60 * 24 * 3); // 2 days
      await sendEmails(
        email,
        `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
      );
      return true;
    }
  }

  @Mutation(() => UserResponse)
  async newPassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() { req, redis }: MyContext
  ): Promise<UserResponse> {
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

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired" }],
      };
    }
    const userNum = Number(userId);
    const user = await User.findOneBy({ _id: userNum });
    if (!user) {
      return {
        errors: [{ field: "token", message: "user no longer exists" }],
      };
    }

    const hashedPassword = await argon2.hash(newPassword);
    await User.update({ _id: userNum }, { password: hashedPassword });
    //delete the change password token
    await redis.del(FORGET_PASSWORD_PREFIX + token);
    req.session.userId = user._id;
    //login the user after password has been changed

    return { user };
  }
}
