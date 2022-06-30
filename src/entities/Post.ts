import { PrimaryKey, Property, Entity } from "@mikro-orm/core";

@Entity()
export class Post {
  @PrimaryKey()
  _id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;
}
