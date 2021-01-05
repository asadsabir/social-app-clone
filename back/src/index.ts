//used mockaroo for fake data
//fix login/logout problem
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from "connect-redis";
import { MyContext } from "./types"
import cors from 'cors'
import { COOKIE_NAME } from "./constants"
import { createConnection } from "typeorm";
import { Post } from "./entities/Post"
import { User } from "./entities/Users"
import "reflect-metadata"
import { Updoot } from './entities/Updoots'


const main = async () => {
     await createConnection({
        type: 'postgres',
        database:'lireddit2',
        username:'postgres',
        password:'Mariam5200',
        logging:true,
        synchronize:true,
        entities:[Post,User, Updoot]
    })

    const app = express()


    const RedisStore = connectRedis(session)  //set request.credentials to "include" in graphql settings 
    const redis = new Redis()

    app.use(
        cors({
            origin:"http://localhost:3000",
            credentials: true
        })
    )

    app.use(
        session({
            name:COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch:true }),
            cookie:{
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure: false, //makes cookie only work in https //change in prod
                sameSite: 'lax', //csrf, google it
            },
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ PostResolver, UserResolver],
            validate: false //change in prod?
        }),
        context: ({req, res} : MyContext) => ({req, res, redis })
    });
    
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {console.log('server started on 4000')})
}

main().catch((e) => {console.log(e)});