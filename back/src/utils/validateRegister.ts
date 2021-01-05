import { UsernamePasswordInput } from "./UsernamePasswordInput"

export const validateRegister = (tit: UsernamePasswordInput) => {
    if(tit.pasword.length <= 2){
        return [ {
            field: 'password',
            message: "password too short"
        }]
    }
    if(!tit.email.includes('@')){
        return [{
            field: 'email',
            message: "invalid email"
        }]
    }
    if( tit.username.includes('@')){
        return [{
                field: 'username',
                message: "Cannot include '@'"
            }]
    }


    return null
}