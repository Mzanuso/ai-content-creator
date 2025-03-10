import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

// Define the base component styles
const baseStyle = definePartsStyle((props) => ({
  container: {
    backgroundColor: mode('white', 'gray.800')(props),
    borderRadius: 'lg',
    boxShadow: 'md',
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
  },
  header: {
    padding: '6',
    borderBottom: '1px solid',
    borderColor: mode('gray.200', 'gray.700')(props),
  },
  body: {
    padding: '6',
  },
  footer: {
    padding: '6',
    borderTop: '1px solid',
    borderColor: mode('gray.200', 'gray.700')(props),
  },
}));

// Define variants
const variants = {
  elevated: definePartsStyle((props) => ({
    container: {
      boxShadow: 'lg',
      _hover: {
        boxShadow: 'xl',
      },
    },
  })),
  outline: definePartsStyle((props) => ({
    container: {
      boxShadow: 'none',
      border: '1px solid',
      borderColor: mode('gray.200', 'gray.700')(props),
    },
  })),
  filled: definePartsStyle((props) => ({
    container: {
      boxShadow: 'none',
      backgroundColor: mode('gray.100', 'gray.700')(props),
    },
  })),
  unstyled: definePartsStyle({
    container: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
    },
    header: {
      padding: 0,
      borderBottom: 'none',
    },
    body: {
      padding: 0,
    },
    footer: {
      padding: 0,
      borderTop: 'none',
    },
  }),
};

// Define sizes
const sizes = {
  sm: definePartsStyle({
    container: {
      borderRadius: 'md',
    },
    header: {
      padding: '3',
    },
    body: {
      padding: '3',
    },
    footer: {
      padding: '3',
    },
  }),
  md: definePartsStyle({
    container: {
      borderRadius: 'lg',
    },
    header: {
      padding: '6',
    },
    body: {
      padding: '6',
    },
    footer: {
      padding: '6',
    },
  }),
  lg: definePartsStyle({
    container: {
      borderRadius: 'xl',
    },
    header: {
      padding: '8',
    },
    body: {
      padding: '8',
    },
    footer: {
      padding: '8',
    },
  }),
};

// Export the component configuration
export default defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    variant: 'elevated',
    size: 'md',
  },
});