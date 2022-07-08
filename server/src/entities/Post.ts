import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt? : Date;

  @Field(() => String)
  @UpdateDateColumn({ type: "date" })
  updatedAt? :Date;

  @Field()
  @Column({ type: "text" })
  title!: string;
}
