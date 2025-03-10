import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Theme config
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Custom colors
const colors = {
  brand: {
    50: '#e0f7ff',
    100: '#b8e2ff',
    200: '#8eceff',
    300: '#63baff',
    400: '#39a6ff',
    500: '#1f8de6', // Primary brand color
    600: '#0c6ebd',
    700: '#004f94',
    800: '#00326c',
    900: '#001844',
  },
};

// Extended theme
const theme = extendTheme({
  config,
  colors,
});

export default theme;