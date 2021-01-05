import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { Layout } from '../../components/Layout'
import { useReadpostQuery } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/UrqlClient'

const Post = ({}) => {
    const router = useRouter()
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id): -1 
    const [{data,fetching}] = useReadpostQuery({
        pause: intId === -1,
        variables: {id: intId}
    })
    if(fetching){
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        )
    }
    return (
        <Layout>
            {data?.Readpost?.text}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post) 