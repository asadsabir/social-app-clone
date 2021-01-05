import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core'
import React, { InputHTMLAttributes } from 'react'
import {useField} from 'formik'

type inputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string
    label:string
    textarea?:boolean
}

export const InputField: React.FC<inputFieldProps> = ({label,size: _,textarea, ...props}) => {

    let Inopt = Input
    if(textarea){
        Inopt = Textarea
    }
    const [field, {error}] = useField(props)
    
    return (
        <FormControl isInvalid={!!error}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Inopt {...field} {...props} id={field.name} placeholder={props.placeholder}/>
                {error ? <FormErrorMessage>{error}</FormErrorMessage>:null}
              </FormControl>
    )
}
