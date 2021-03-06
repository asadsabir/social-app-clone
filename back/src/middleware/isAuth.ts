import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";


export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => { //runs before resolver
    if(!context.req.session.userId) {
        throw new Error("not authenticated");
    }
    return next()
}