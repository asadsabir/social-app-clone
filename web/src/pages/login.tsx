import React from 'react'
import { Formik, Form } from "formik";
import { Box, Button, Flex, FormControl, Link } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { useRouter } from "next/router";
import { useLoginMutation, useLogoutMutation, useMeQuery } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/UrqlClient';
import  NextLink  from "next/link";
interface LoginProps {}

const Login: React.FC<LoginProps> = ({}) => {
    const router = useRouter()
    const [,login] = useLoginMutation()
    return (
        <Wrapper>
            <Formik 
            initialValues={{usernameOrEmail:'',password:''}}
            onSubmit={ async (va, {setErrors}) => {
                console.log(va)
                const response = await login(va)
                if (response.data?.Login.errors) {
                    console.log(toErrorMap(response.data.Login.errors))
                    setErrors(toErrorMap(response.data.Login.errors))
                }else{
                    if (typeof router.query.next === "string"){
                        router.push(router.query.next)
                    }else{router.push('/')}
                }
            }}
        >
            {({isSubmitting}) => (
                <Form>
                    {/*  name is case sensitive, keep first letter of components capital */}
                    <InputField
                        name = "usernameOrEmail"
                        placeholder = 'Username or Email'
                        label = "Username or Email"
                    />
                    <Box mt={4}>
                    <InputField
                        name = "password"
                        placeholder = 'password'
                        label = "Password"
                        type = 'password'
                    />
                    </Box>
                    <Flex mt={2}>
                    <NextLink href='/forgot-password'>
                        <Link ml='auto'>forgot password?</Link>
                    </NextLink>
                    </Flex>
                    <Button mt={4} type = 'submit' variantColor = "teal" isLoading = {isSubmitting}>login</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
        
    )
}

export default withUrqlClient(createUrqlClient)(Login)