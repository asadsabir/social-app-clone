
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoots";
//import { Updoot } from "./Updoots";

@ObjectType()
@Entity()
export class User extends BaseEntity{
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({unique: true,})
  username!: string;

  //@Field(() => String) field is commented out, won't show up on graphql
  @Column()
  password!: string;

  @Field()
  @Column({unique: true})
  email!: string

  @OneToMany(() => Post, posts => posts.creator )
  posts: Post[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @OneToMany(() => Updoot, updoot => updoot.user )
  updoot: Updoot[]
}