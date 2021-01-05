
import { Box, Flex, Link, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { InputField } from '../components/inputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { createUrqlClient } from '../utils/UrqlClient'


 const ForgotPassword:React.FC<{}> = ({}) => {
    const [,forgotpass] = useForgotPasswordMutation()
    const [complete,setComplete] = useState(false)

    return (
        <Wrapper>
            <Formik 
            initialValues={{email:''}}
            onSubmit={ async (va, {setErrors}) => {
                await forgotpass(va)
                setComplete(true)
            }}
        >
            {({isSubmitting}) => complete ? <Box>email sent</Box>: (
                <Form>
                    {/*  name is case sensitive, keep first letter of components capital */}
                    <InputField
                        name = "email"
                        placeholder = 'Email'
                        label = "Email"
                    />
                    <Button mt={4} type = 'submit' variantColor = "teal" isLoading = {isSubmitting}>receive email with password reset link</Button>
                </Form>
            )}
        </Formik>
        </Wrapper>
        
    )
}

export default withUrqlClient(createUrqlClient) (ForgotPassword)
