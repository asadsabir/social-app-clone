
import { Box, Button } from '@chakra-ui/core'
import { Formik, Form } from 'formik'
import { withUrqlClient } from 'next-urql'
import { InputField } from '../components/inputField'
import { useCreatePostMutation, useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utils/UrqlClient'
import { Layout } from '../components/Layout'
import { useisAuth } from '../utils/useisAuth'


const CreatePost: React.FC<{}> = ({}) => {
    useisAuth()
    const [,create] = useCreatePostMutation()
    const router = useRouter()
    
    return (
        <Layout variant="small">
            <Formik 
            initialValues={{title:'',text:''}}
            onSubmit={ async (va, {setErrors}) => {
                console.log(va)
                const {error} = await create({input: va})
                if(!error){console.log('looooo');router.push('/')}
            }}
        >
            {({isSubmitting}) => (
                <Form>
                    {/*  name is case sensitive, keep first letter of components capital */}
                    <InputField
                        name = "title"
                        placeholder = 'title'
                        label = "Title"
                    />
                    <Box mt={4}>
                    <InputField
                        name = "text"
                        placeholder = 'text...'
                        label = "Body"
                        textarea= {true}
                    />
                    </Box>
                    <Button mt={4} type = 'submit' variantColor = "teal" isLoading = {isSubmitting}>Create post</Button>
                </Form>
            )}
        </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost)
