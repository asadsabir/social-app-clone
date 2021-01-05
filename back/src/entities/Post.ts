
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Updoot } from "./Updoots";
//import { Updoot } from "./Updoots";
import { User } from "./Users";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({type: 'text'})
  title!: string;

  @Field()
  @Column({type: 'text'})
  text!: string;

  @Field()
  @Column({type: 'int', default: 0})
  points!: number;

  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator: User

  @Field(() => Updoot)
  @OneToMany(() => Updoot, updoot => updoot.post)
  updoot: Updoot[]

  @Field()
  @Column()
  creatorId: number

  @Field(() => Int, {nullable:true})
  voteStatus: number | null;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
}