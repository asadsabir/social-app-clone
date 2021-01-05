import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import { Post } from "./Post";
import { User } from "./Users";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field()
  @Column({type: "int"})
  value: number;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field()
  @Column({type: 'text', default: 0})
  points!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.updoot)
  post: Post

  @Field()
  @PrimaryColumn()
  postId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.updoot)
  user: User

}