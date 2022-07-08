import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BaseEntity,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field(() => String)
  @CreateDateColumn({ type: "date" })
  createdAt? : Date;

  @Field(() => String)
  @UpdateDateColumn({ type: "date" })
  updatedAt? : Date;

  @Field()
  @Column({ type: "text", unique: true })
  username!: string;

  @Field()
  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;
}
