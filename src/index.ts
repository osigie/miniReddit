
import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { Post } from "./entities/Post";
import express, { Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const app = express();
const initializer = async () => {
  const orm = await MikroORM.init(microConfig);
  const em = orm.em.fork();
  await orm.getMigrator().up();
  // const generator = orm.getSchemaGenerator();
  // await generator.updateSchema();



const post = em.create(Post, { title: "Hello" });
await em.persistAndFlush(post);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: em }),
  });

  await apolloServer.start();
apolloServer.applyMiddleware({app})


  // app.get("/", (_req, res: Response) => {
  //   res.send("this is a test");
  // });

  app.listen(3500, () => {
    console.log("server listening on port 3500");
  });
};

initializer().catch((e) => console.log(e, "an error occurred"));
