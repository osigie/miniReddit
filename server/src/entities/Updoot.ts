import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  ManyToMany,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @ManyToMany(() => User, (user) => user.updoots)
  user: User;

  @Field()
  @PrimaryColumn({ type: "int" })
  creatorId!: number;

  @Field()
  @PrimaryColumn({ type: "int" })
  postId!: number;

  @Field()
  @ManyToMany(() => Post, (post) => post.updoots)
  post: User;

  @Field()
  @Column({ type: "int" })
  vote_point!: number;
}
