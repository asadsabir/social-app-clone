import { Box } from '@chakra-ui/core'
import React from 'react'

export type WrapperVariant = "small" | "regular"

interface WrapperProps {
    variant?: WrapperVariant
}

export const Wrapper: React.FC<WrapperProps> = ({children, variant}) => {
    return (
        <Box maxWidth={variant === 'small' ? "400px":"800px"} width="100%" mt={8} mx="auto" w="100%">
            {children}
        </Box>
    )
}
