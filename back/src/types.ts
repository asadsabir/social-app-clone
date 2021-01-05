import { Request, Response} from "express";
import { Redis } from 'ioredis'


export type MyContext = { 
    req:Request & {session: Express.Session}, //'&' joins 2 types, did this to remove undefined from express.session type
    res: Response,
    redis: Redis
}