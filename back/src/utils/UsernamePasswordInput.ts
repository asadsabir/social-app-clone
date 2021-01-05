import { InputType, Field } from "type-graphql";



@InputType() //input types for args
export class UsernamePasswordInput {
    @Field()
    email: string;

    @Field()
    username: string;
    @Field()
    pasword: string;
}
