import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { DataSource } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types/types";

const app = express();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "12345",
  database: "minireddit2",
  entities: [User, Post],
  synchronize: true,
  logging: true,
});
const initializer = async () => {
  // sendMail("kenosagie88@gmail.com", "this is a test")

  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  // redis@v4
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.set("trust proxy", process.env.NODE_ENV !== "production");
  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: false }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 5, //5 years
        httpOnly: true,
        secure: true, //only in production
        sameSite: "none", //csrf
      },
      saveUninitialized: false,
      secret: "kjsxfksjifhisufhsjkdhfsdhfioshf",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    csrfPrevention: true,
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // app.get("/", (_req, res: Response) => {
  //   res.send("this is a test");
  // });

  app.listen(3500, () => {
    console.log("server listening on port 3500");
  });
};

initializer().catch((e) => console.log(e, "an error occurred"));
