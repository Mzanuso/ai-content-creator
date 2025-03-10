import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      fontFamily: 'body',
      color: mode('gray.800', 'whiteAlpha.900')(props),
      bg: mode('white', 'gray.900')(props),
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: mode('gray.400', 'whiteAlpha.400')(props),
    },
    '*, *::before, *::after': {
      borderColor: mode('gray.200', 'whiteAlpha.300')(props),
      wordWrap: 'break-word',
    },
    // Custom scrollbar for dark mode
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: mode('gray.100', 'gray.800')(props),
    },
    '::-webkit-scrollbar-thumb': {
      bg: mode('gray.300', 'gray.600')(props),
      borderRadius: '8px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: mode('gray.400', 'gray.500')(props),
    },
  }),
};

export default styles;