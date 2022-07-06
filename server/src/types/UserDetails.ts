import { Field, InputType } from "type-graphql";

@InputType()
export class UserDetails {
  @Field()
  password: string;
  @Field()
  username: string;
  @Field()
  email: string;
}
