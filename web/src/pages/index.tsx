import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/core'
import { withUrqlClient } from 'next-urql'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/UrqlClient'
import  NextLink  from "next/link";
import React, { useState } from 'react'
import { Updoot } from '../components/Updoot'


const Index = () => {
  const [page, setPage] = useState({limit: 10, cursor:null as string | null})
  const [{data, fetching}] = usePostsQuery({
    variables:page
  })
  return(
    <Layout>
    <Flex textAlign="center">
      <Heading>LiReddit</Heading>
    
    <NextLink  href='/create-post'>
    <Link ml="auto">create post</Link>
    </NextLink>
    </Flex>
    <br/>
    {!data && fetching ? <div>loading...</div>:
      
      <Stack spacing={8}> 
        {data?.Posts.posts.map((p) => 
        <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
        <Box>
          <Updoot post={p}/>
        </Box>
        <Box>
        <Heading fontSize="xl">{p.title}</Heading> OP: {p.creator.username}
        <Text mt={4}>{p.textSnippet}</Text>
        </Box>
        
        
      </Flex> 
        )}
      </Stack>
    }
    {data && data.Posts.hasMore ? 
      <Flex>
        <Button isLoading={fetching} onClick={() => {setPage({limit:10, cursor:data.Posts.posts[data.Posts.posts.length - 1].createdAt})}} m='auto' my={8}>load more...</Button>
      </Flex>
      
    :null}
    </Layout>
  )
}
  


export default withUrqlClient(createUrqlClient, {ssr: true})(Index) //ssr(server side rendering is good for seo, decides if page should be loaded before or after making graphql requests)
