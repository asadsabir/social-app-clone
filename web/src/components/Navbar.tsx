import { Box, Button, Flex, Link } from "@chakra-ui/core"
import React, { Fragment } from "react"
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from "../generated/graphql"
import { useRouter } from "next/router"
import { isServer } from "../utils/isServer"

interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = ({}) => {
    const router = useRouter()
    const [{fetching: logoutfetching},logout] = useLogoutMutation()
    const [{data, fetching}] = useMeQuery({pause: isServer()})
    let body = null
    if (fetching) {
    }else if (!data?.me){
        body = (
            <Fragment>
                <NextLink href='/login'>
                    <Link  mr = {2}>login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link >register</Link>
                </NextLink>
            </Fragment>
        ) 
        
        
    }else {
        
        body = (
        <Flex>
            <Box mr={2}>{data.me.username}</Box>
            <Button variant='link' onClick= {
                async() => {
                    const islogged = await logout()
                    if (!islogged.data?.Logout){
                        console.log('ddd')
                    }
                }
            } isLoading = {logoutfetching}>logout</Button>
        </Flex>
        )
    }
    return (
        <Flex zIndex={1} position="sticky" top="0" bg='tan' p={4} ml='auto'>
            <Box ml = 'auto'>
                {body}
            </Box>
        </Flex>
    )
}