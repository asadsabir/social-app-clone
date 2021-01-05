import React from 'react'
import { Formik, Form } from "formik";
import { Box, Button, FormControl } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/inputField';
import { useRouter } from "next/router";
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/UrqlClient';

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter()
    const [,register] = useRegisterMutation()
    return (
        <Wrapper>
            <Formik 
            initialValues={{email: '', username:'',pasword:''}}
            onSubmit={ async (va, {setErrors}) => {
                console.log(va)
                const response = await register({options:va})
                if (response.data?.Register.errors) {
                    console.log(toErrorMap(response.data.Register.errors))
                    setErrors(toErrorMap(response.data.Register.errors))
                }else{
                    console.log('bla')
                    router.push('/')
                }
            }}
        >
            {({isSubmitting}) => (
                <Form>
                    {/*  name is case sensitive, keep first letter of components capital */}
                    <InputField
                        name = "email"
                        placeholder = 'Email'
                        label = "Email"
                    />
                    <Box mt={4}>
                    <InputField
                        name = "username"
                        placeholder = 'username'
                        label = "Username"
                    />
                    </Box>
                    <Box mt={4}>
                    <InputField
                        name = "pasword"
                        placeholder = 'password'
                        label = "Password"
                        type = 'password'
                    />
                    </Box>
                    <Button mt={4} type = 'submit' variantColor = "teal" isLoading = {isSubmitting}>register</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
        
    )
}

export default withUrqlClient(createUrqlClient)(Register)
