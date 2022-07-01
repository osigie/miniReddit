import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    glob: "!(*.d).{js}", // how to match migration files (all .js and .ts files, but not .d.ts)
    // pattern:/^[\w-]+\d+\.[tj]s$/
  },
  entities: [Post],
  type: "postgresql",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "12345",
  dbName: "minireddit",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];


