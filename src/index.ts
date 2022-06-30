import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { Post } from "./entities/Post";

const initializer = async () => {
  const orm = MikroORM.init(microConfig);

  //   await orm.em.persistAndFlush(Post);
};

initializer().catch((e) => console.log(e, "an error occurred")); 

