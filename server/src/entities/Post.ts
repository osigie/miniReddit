import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn({ type: "date" })
  updatedAt?: Date;

  @Field()
  @Column({ type: "text" })
  title!: string;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field()
  @Column()
  creatorId!: number;

  @Field()
  @Column({ type: "text" })
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; //1|-1|null
}
