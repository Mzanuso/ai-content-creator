import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Global style overrides
import styles from './styles';

// Component style overrides
import Button from './components/button';
import Card from './components/card';
import Input from './components/input';

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
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#0f131b', // Darker than default for better background
  },
};

// Custom font sizes
const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

// Extended theme
const theme = extendTheme({
  config,
  colors,
  fontSizes,
  styles,
  components: {
    Button,
    Card,
    Input,
  },
});

export default theme;