import { User } from "../entities/Users";
import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, Field, ObjectType, Query, FieldResolver, Root } from "type-graphql"; 
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/mailshtuff";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field:string

    @Field()
    message:string

}

@ObjectType() // object types for returning
class LoginResponse {
    @Field(() => [FieldError], {nullable:true})
    errors?: FieldError[]
    
    @Field(() => User, {nullable:true})
    user?: User
}

@Resolver(User)
export class  UserResolver{
    @FieldResolver(() => String) //runs when querying a certain field
    email(
        @Root() user: User,
        @Ctx() {req}: MyContext
    ) {
        if(req.session.userId === user.id) {
            return user.email
        }
        return ''
    }

    @Mutation(() => LoginResponse)
    async ChangePassword(
        @Arg('newpass') newpass: string,
        @Arg('token') token: string,
        @Ctx() { redis, req}: MyContext
    ):Promise<LoginResponse>{
        const userId = await redis.get(FORGET_PASSWORD_PREFIX+token)
        if(!userId){
            return { 
                errors: [{
                field: 'token',
                message:'token expired'
            }]}
        }
        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum)
        if (!user) {
            return { 
                errors: [{
                field: 'token',
                message:'link expired'
            }]}
        }
        if (newpass.length <= 2){
            return { 
                errors: [{
                field: 'newPass',
                message:'Password length must be more than 2 charachters'
            }]}
        }
        
        const hashedPass = await argon2.hash(newpass)
        user.password = hashedPass
        await User.update(userIdNum,{password:hashedPass})
        req.session.userId = user.id
        redis.del(FORGET_PASSWORD_PREFIX+token)
        return {
            user
        }
    }

    @Mutation(() => Boolean)
    async ForgotPass(
        @Arg('email') email: string,
        @Ctx() { redis}:MyContext
    ){
        const user = await User.findOne({where: {email}})
        if (!user) {
            return true
        }
        
        const token = v4()
        redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'px', 1000 * 60 * 60 * 24 * 3)
        const message = `<a href="http://localhost:3000/changepass/${token}">reset password</a>` //backtics for in string stuff
        sendEmail(email,message)
        return true
    }

    @Query(() => User, {nullable:true})
     me(
        @Ctx() { req,  }: MyContext
    ){
        if(!req.session.userId) {
            return null
        }

        return User.findOne({id: req.session.userId})
    }

    @Mutation(() => LoginResponse) //specifies what returns for graphql
    async Register(
        @Arg('newuserinfo') tit : UsernamePasswordInput, 
        @Ctx() { req}: MyContext 
    ): Promise<LoginResponse> {
        const errors = validateRegister(tit)
        if (errors){return { errors}}
        const hashedPass = await argon2.hash(tit.pasword)
        let user;   
        try {
            //User.create.save, look at posts
            const result = getConnection().createQueryBuilder().insert().into(User).values(
                {
                    username: tit.username,
                    email: tit.email,
                    password: hashedPass,                 
                }
            ).returning('*').execute();
            user = (await result).raw[0]
        }catch(err){
            if(err.code === '23505' || err.name == 'ValidationError'){
                return {
                    errors:[{
                        field: 'username',
                        message: "username already exists"
                    }]
                }
            }
        } 
        req.session.userId = user.id 
        return { user: user}
    }

    @Mutation(() => LoginResponse) //specifies what returns for graphql
    async Login(
        @Arg('useroremail') useroremail: string,
        @Arg('password') password : string, 
        @Ctx() { req}: MyContext 
    ): Promise<LoginResponse> {   
        const bejudged = await User.findOne(useroremail.includes('@') ? {where: {email: useroremail}}:{where: {username: useroremail}})
        const er = {
            errors: [{
                field: "usernameOrEmail",
                message:"username or password incorrect"
            },{
                field:"password",
                message:"username or password incorrect"
            }]
        } 
        if(!bejudged){
            return er
        }
        const valid = await argon2.verify(bejudged.password,password)
        if(!valid){
            return er
        }else{
            req.session.userId = bejudged.id
            return {
            user: bejudged
        }}
        
        
    }

    @Mutation(() => Boolean)
    Logout(
        @Ctx() {req, res}: MyContext 
    ){
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err)
                    resolve(false)
                    return
                }else{ 
                    res.clearCookie(COOKIE_NAME)
                    resolve(true); 
                    return
                }
            })
        })
        }
}