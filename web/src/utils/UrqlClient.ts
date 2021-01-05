import { cacheExchange, NullArray, QueryInput, Resolver, Variables } from "@urql/exchange-graphcache";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe,tap } from "wonka";
import Router  from "next/router";
import gql from "graphql-tag";
import { isServer } from "./isServer";
const errorExchange: Exchange = ({forward}) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({error}) => {
      if(error?.message.includes('not authenticated')){
        Router.replace('/login')
        console.log('wan')
      }
    })
      
    
  )
}

const cursorPagination = (): Resolver => {
  

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    // console.log(info)
    // console.log(fieldArgs) //comment in to understand if you forget
    // console.log(entityKey, fieldName)
    //console.log(allFields)
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    const inCache = cache.resolve( cache.resolveFieldByKey(entityKey,`${fieldName}(${stringifyVariables(fieldArgs)})`) as string,"posts")
    info.partial = !inCache
    let hasMore = true
    const results:string[] = [] 
    fieldInfos.forEach( (fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key,'posts') as string[]
      hasMore = cache.resolve(key, 'hasMore') as boolean
      results.push(...data)
      //console.log(hasMore, data)
    })
    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }

  //   const visited = new Set();
  //   let result: NullArray<string> = [];
  //   let prevOffset: number | null = null;

  //   for (let i = 0; i < size; i++) {
  //     const { field, arguments: args } = fieldInfos[i];
  //     if (args === null || !compareArgs(fieldArgs, args)) {
  //       continue;
  //     }

  //     const links = cache.resolveFieldByKey(entityKey, field) as string[];
  //     const currentOffset = args[offsetArgument];

  //     if (
  //       links === null ||
  //       links.length === 0 ||
  //       typeof currentOffset !== 'number'
  //     ) {
  //       continue;
  //     }

  //     if (!prevOffset || currentOffset > prevOffset) {
  //       for (let j = 0; j < links.length; j++) {
  //         const link = links[j];
  //         if (visited.has(link)) continue;
  //         result.push(link);
  //         visited.add(link);
  //       }
  //     } else {
  //       const tempResult: NullArray<string> = [];
  //       for (let j = 0; j < links.length; j++) {
  //         const link = links[j];
  //         if (visited.has(link)) continue;
  //         tempResult.push(link);
  //         visited.add(link);
  //       }
  //       result = [...tempResult, ...result];
  //     }

  //     prevOffset = currentOffset;
  //   }

  //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
  //   if (hasCurrentPage) {
  //     return result;
  //   } else if (!(info as any).store.schema) {
  //     return undefined;
  //   } else {
  //     info.partial = true;
  //     return result;
  //   }
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = ''
  if(isServer()){
    cookie = ctx.req.headers.cookie
  }
  return {
    url: 'http://localhost:4000/graphql' as const,
    fetchOptions: {  
      credentials: 'include' as const,
      headers: cookie ? {
        cookie
      } : undefined
    },
    exchanges: [dedupExchange, cacheExchange({
      keys: {
        PaginatedPosts: () => null
      },
      resolvers: {
        Query: {
          Posts: cursorPagination(),
        }
      },
      updates : {
        Mutation: {
          vote:(_result, args, cache, info) => {
            const {postId, value} = args as VoteMutationVariables
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                } 
              `,
              {id: postId} as any
            )
            console.log(data)
            if(data){
              if(data.voteStatus === value){return}
              const newPoints = (data.points as number) + value - (data.voteStatus as number)
              cache.writeFragment(
                gql`
                fragment __ on Post {
                  points
                  voteStatus
                }
                `,{id: postId,points: newPoints, voteStatus: value} as any
              )
            }
            
          },
          Createpost: (_result, args, cache, info) => {
            const allFields = cache.inspectFields('Query')
            const fieldInfos = allFields.filter(info => info.fieldName === 'Posts');
            fieldInfos.forEach((f) => {
              cache.invalidate('Query', 'Posts', f.arguments || {})
            })
            console.log(cache.inspectFields('Query'))
          },
          Login: (_result, args, cache, info) => {
            console.log('hfsh')
            //cache.updateQuery({query: MeDocument}, data => { <----- doesn't work cause types stuff so made better udate query
            betterUpdateQuery<LoginMutation,MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
              if (result.Login.errors){
                return query
              }else {
                return {
                  me: result.Login.user,
                }
              } 
            })
          },
          Register: (_result, args, cache, info) => {
            //cache.updateQuery({query: MeDocument}, data => { <----- doesn't work cause types stuff so made better udate query
            betterUpdateQuery<RegisterMutation,MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
              if (result.Register.errors){
                return query
              }else {
                return {
                  me: result.Register.user,
                }
              } 
            })
          },
          Logout: (_result, args, cache, info) => {
            //cache.updateQuery({query: MeDocument}, data => { <----- doesn't work cause types stuff so made better udate query
            betterUpdateQuery<LogoutMutation,MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
              if (!result.Logout){
                return query
              }else {
                return {
                  me: null,
                }
              } 
            })
          }

        }
    }}),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ]
  }
  }