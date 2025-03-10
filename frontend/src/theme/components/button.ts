import { defineStyleConfig } from '@chakra-ui/react';

const Button = defineStyleConfig({
  // Base style applied to all button variants
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'md',
    _focus: {
      boxShadow: 'outline',
    },
  },
  
  // Styles for different visual variants
  variants: {
    // Primary button style
    primary: {
      bg: 'brand.500',
      color: 'white',
      _hover: {
        bg: 'brand.600',
        _disabled: {
          bg: 'brand.500',
        },
      },
      _active: {
        bg: 'brand.700',
      },
    },
    
    // Secondary/outline button style
    secondary: {
      bg: 'transparent',
      color: 'brand.500',
      border: '1px solid',
      borderColor: 'brand.500',
      _hover: {
        bg: 'brand.50',
        color: 'brand.600',
        _disabled: {
          bg: 'transparent',
        },
      },
      _active: {
        bg: 'brand.100',
      },
    },
    
    // Ghost button style
    ghost: {
      bg: 'transparent',
      color: 'gray.500',
      _hover: {
        bg: 'whiteAlpha.200',
      },
      _active: {
        bg: 'whiteAlpha.300',
      },
    },
    
    // Danger button style
    danger: {
      bg: 'red.500',
      color: 'white',
      _hover: {
        bg: 'red.600',
        _disabled: {
          bg: 'red.500',
        },
      },
      _active: {
        bg: 'red.700',
      },
    },
  },
  
  // Default sizes
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 4,
      py: 2,
    },
    md: {
      fontSize: 'md',
      px: 6,
      py: 3,
    },
    lg: {
      fontSize: 'lg',
      px: 8,
      py: 4,
    },
  },
  
  // Default values
  defaultProps: {
    variant: 'primary',
    size: 'md',
  },
});

export default Button;