import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express, { Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import * as redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";

const app = express();

const initializer = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const em = orm.em.fork();

  // redis@v4
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.set("trust proxy", process.env.NODE_ENV !== "production");
  app.use(
    cors({
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(
    session({
      name: "hpm",
      store: new RedisStore({ client: redisClient, disableTouch: false }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 5, //5 years
        httpOnly: true,
        secure: __prod__, //only in production
        sameSite: "lax", //csrf
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
    context: ({ req, res }): MyContext => ({ em: em, req, res }),
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
