import { useRouter } from "next/router"
import { useEffect } from "react"
import { useMeQuery, useCreatePostMutation } from "../generated/graphql"


export const useisAuth = () => {
    const [{data, fetching}] = useMeQuery()
    const router = useRouter()
    useEffect(() => {
        if(!data?.me?.id && !fetching){
            router.replace('/login?next=' + router.pathname)
        }
    }, [data,router,fetching])
}