import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const baseStyle = definePartsStyle((props) => ({
  field: {
    width: '100%',
    minWidth: 0,
    outline: 0,
    position: 'relative',
    appearance: 'none',
    transitionProperty: 'common',
    transitionDuration: 'normal',
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  addon: {
    width: 'auto',
    height: 'auto',
    transitionProperty: 'common',
    transitionDuration: 'normal',
  },
  element: {
    marginStart: '0.5rem',
  },
}));

const sizes = {
  sm: definePartsStyle({
    field: {
      fontSize: 'sm',
      px: 3,
      py: 2,
      borderRadius: 'sm',
    },
    addon: {
      fontSize: 'sm',
      px: 3,
      py: 2,
      borderRadius: 'sm',
    },
  }),
  md: definePartsStyle({
    field: {
      fontSize: 'md',
      px: 4,
      py: 2,
      borderRadius: 'md',
    },
    addon: {
      fontSize: 'md',
      px: 4,
      py: 2,
      borderRadius: 'md',
    },
  }),
  lg: definePartsStyle({
    field: {
      fontSize: 'lg',
      px: 4,
      py: 3,
      borderRadius: 'md',
    },
    addon: {
      fontSize: 'lg',
      px: 4,
      py: 3,
      borderRadius: 'md',
    },
  }),
};

const variants = {
  outline: definePartsStyle((props) => ({
    field: {
      border: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.300')(props),
      bg: 'inherit',
      _hover: {
        borderColor: mode('gray.400', 'whiteAlpha.400')(props),
      },
      _readOnly: {
        boxShadow: 'none !important',
        userSelect: 'all',
      },
      _focus: {
        borderColor: mode('brand.500', 'brand.300')(props),
        boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.300')(props)}`,
      },
      _invalid: {
        borderColor: mode('red.500', 'red.300')(props),
        boxShadow: `0 0 0 1px ${mode('red.500', 'red.300')(props)}`,
      },
    },
    addon: {
      border: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.300')(props),
      bg: mode('gray.100', 'whiteAlpha.100')(props),
    },
  })),
  filled: definePartsStyle((props) => ({
    field: {
      border: '2px solid',
      borderColor: 'transparent',
      bg: mode('gray.100', 'whiteAlpha.100')(props),
      _hover: {
        bg: mode('gray.200', 'whiteAlpha.200')(props),
      },
      _readOnly: {
        boxShadow: 'none !important',
        userSelect: 'all',
      },
      _focus: {
        bg: 'transparent',
        borderColor: mode('brand.500', 'brand.300')(props),
      },
      _invalid: {
        borderColor: mode('red.500', 'red.300')(props),
      },
    },
    addon: {
      border: '2px solid',
      borderColor: 'transparent',
      bg: mode('gray.100', 'whiteAlpha.100')(props),
    },
  })),
  flushed: definePartsStyle((props) => ({
    field: {
      borderBottom: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.300')(props),
      borderRadius: 0,
      px: 0,
      bg: 'transparent',
      _hover: {
        borderColor: mode('gray.400', 'whiteAlpha.400')(props),
      },
      _readOnly: {
        boxShadow: 'none !important',
        userSelect: 'all',
      },
      _focus: {
        borderColor: mode('brand.500', 'brand.300')(props),
        boxShadow: `0 1px 0 0 ${mode('brand.500', 'brand.300')(props)}`,
      },
      _invalid: {
        borderColor: mode('red.500', 'red.300')(props),
        boxShadow: `0 1px 0 0 ${mode('red.500', 'red.300')(props)}`,
      },
    },
    addon: {
      borderBottom: '1px solid',
      borderColor: mode('gray.300', 'whiteAlpha.300')(props),
      borderRadius: 0,
      px: 0,
      bg: 'transparent',
    },
  })),
};

export default defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: 'md',
    variant: 'outline',
  },
});