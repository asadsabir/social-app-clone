import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePassMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { createUrqlClient } from '../../utils/UrqlClient';
import NextLink from 'next/link';

export const ChangePassword: NextPage = () => {
    const [,changepass] = useChangePassMutation()
    const router = useRouter()
    const [tokenError, setTokenError] = useState('')
    return (
        <Wrapper>
            <Formik 
            initialValues={{newPass:''}}
            onSubmit={ async (va, {setErrors}) => {
                console.log(va)
                const response = await changepass({newPass:va.newPass,token:typeof router.query.token === 'string'? router.query.token:''})
                if (response.data?.ChangePassword.errors) {
                    if (response.data.ChangePassword.errors[0].field = 'token'){
                        setTokenError(toErrorMap(response.data.ChangePassword.errors).token)
                    }
                    setErrors(toErrorMap(response.data.ChangePassword.errors))
                }else{
                    router.push('/')
                    console.log('looo')
                    return
                }
            }}
        >
            {({isSubmitting}) => (
                <Form>
                    <Box mt={4}>
                    <InputField
                        name = "newPass"
                        placeholder = 'new password'
                        label = "New Password"
                        type = 'password'
                    />
                    </Box>
                    {tokenError ?
                    <Flex>
                        <Box mr={2} style={{color: 'red'}}>{tokenError}</Box>
                        <NextLink href='/forgot-password'>
                        <Link>click here to get a new link</Link>
                        </NextLink>
                    </Flex>
                     :null}
                    <Button mt={4} type = 'submit' variantColor = "teal" isLoading = {isSubmitting}>change password</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
    )
}



export default  withUrqlClient(createUrqlClient)(ChangePassword)