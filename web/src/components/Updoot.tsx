import { Flex, IconButton } from '@chakra-ui/core'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql'

interface UpdootProps {
    post: PostSnippetFragment
}

export const Updoot: React.FC<UpdootProps> = ({post}) => {
    const [loadingstate, setLoadingState] = useState<'updootloading' | 'downdootloading' | 'notloading'>('notloading')
    const [,vote] = useVoteMutation()
    return (
        <Flex mr={4} direction='column'justifyContent="center" alignItems="center">
            <IconButton onClick={async() => {
                if(post.voteStatus === 1){return}
                setLoadingState('updootloading')
                await vote({
                    postId:post.id,
                    value:1
                })
                setLoadingState('notloading')
            }}
            variantColor={post.voteStatus === 1 ? "green": undefined}
            icon="chevron-up" 
            aria-label="updoot" 
            isLoading={loadingstate === 'updootloading'}/>
            {post.points}
            <IconButton onClick={async() => {
                if(post.voteStatus === -1){return}
                setLoadingState('downdootloading')
                vote({
                    postId:post.id,
                    value: -1
                })
                setLoadingState('notloading')
            }} variantColor={post.voteStatus === -1 ? "red": undefined} icon="chevron-down" aria-label="downdoot" isLoading={loadingstate === 'downdootloading'}/>
          </Flex>
    )
}
