import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Int, Mutation, InputType, Field, UseMiddleware, Ctx, Root, FieldResolver, ObjectType } from "type-graphql"; //use to see whats for ts and whats for graphql
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoots";

@InputType()
class PostInput {
    @Field()
    title: string

    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts{
    @Field(() => [Post])
    posts: Post[]

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class  PostResolver{
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ){
        return root.text.slice(0,50)
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext
    ){
        
        const {userId} = req.session
        const isUp = value !== -1
        const rval:number = isUp ? 1 : -1 //incase value is some other number
        const prev = await Updoot.findOne({where: {postId, userId}})
        if (prev && prev.value !== rval){
            getConnection().transaction(async (tm) => {
                await tm.query(`
                   update updoot
                   set value = $1
                   where "postId" = $2 and "userId" = $3 
                `,[rval, postId, userId])
                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `,[2*rval, postId])
            })
        }else if (!prev) {
            getConnection().transaction(async tm => {
                tm.query(`
                    insert into updoot ("userId", "postId", value)
                    values ($1,$2,$3)
                `,[userId,postId,rval])
                tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `,[rval,postId])
            })
        }
        return true
    }

    @Query(() => PaginatedPosts) // type for Graphql
    async Posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, {nullable:true}) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit) + 1
        const replacements: any[] = [realLimit, req.session.userId]
        if(cursor){ replacements.push(new Date(parseInt(cursor)))}
        let cursoridx = 3
        cursoridx = replacements.length
        const posts = await getConnection().query(`
            select p.*,
            json_build_object(
                'id',u.id, 
                'username', u.username,
                'email', u.email
            ) creator,
            ${req.session.userId?'(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' : 'null as "voteStatus"'}
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursoridx}` : ''}
            order by p."createdAt" DESC
            limit $1
        `,replacements) 

        console.log(posts)
        // const p = getConnection()
        // .getRepository(Post)
        // .createQueryBuilder('post')
        // .innerJoinAndSelect(
        //     'post.creator',
        //     'u',
        //     'u.id = : post."creatorId"'
        // )
        // .orderBy('post."createdAt"', "DESC")
        // .take(realLimit)
        

        // if (cursor){
        //     p.where('post."createdAt" < :cursor',{cursor: new Date(parseInt(cursor))})
            
        // }
        //const posts = await p.getMany()
        return {
            posts: posts.slice(0, realLimit - 1),
            hasMore: posts.length === realLimit
        }
    }

    @Query(() => Post, {nullable:true}) // type for Graphql //query for R, mutation for CUD
    Readpost(
        @Arg('identifier', () => Int) id : number, 
    ): Promise<Post | undefined> {  //for ts 
        return  Post.findOne(id) 
    }

    @Mutation(() => Post) //specifies what returns for graphql
    @UseMiddleware(isAuth) //runs before resolving
    async Createpost(
        @Arg('stuff') input : PostInput,
        @Ctx() {req }: MyContext  
    ): Promise<Post> { 
        //2 sql queries                     
        return Post.create({...input, creatorId:req.session.userId}).save() // {title:title} same as {title}
    }

    @Mutation(() => Post, {nullable:true}) 
    async Updateposts(
        @Arg('identifier',() => Int) id : number,
        @Arg('newtitle') title : string,  
    ): Promise<Post | null> {
          const phost = await Post.findOne(id)
          if(!phost){ return null} 
            if(typeof title !== undefined){
                await Post.update({id},{title})
            }
            return phost
    }

    @Mutation(() => Boolean) 
    async Deleteposts(
        @Arg('identifier',() => Int) id : number,  
    ): Promise<Boolean> {
        await Post.delete({id})
        return true
    }
} 