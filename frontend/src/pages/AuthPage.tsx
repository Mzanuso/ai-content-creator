import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
  FormErrorMessage,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { login, register, loginWithGoogle, clearError } from '../features/auth/authSlice';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const redirect = searchParams.get('redirect') === 'true';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    // Clear any previous auth errors
    dispatch(clearError());
  }, [dispatch, mode]);
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate(redirect ? '/dashboard' : '/');
    }
  }, [isAuthenticated, navigate, redirect]);
  
  useEffect(() => {
    // Show error toast if there's an authentication error
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setDisplayNameError('');
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Display name validation (only for register mode)
    if (mode === 'register' && !displayName) {
      setDisplayNameError('Name is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (mode === 'login') {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ email, password, displayName }));
    }
  };
  
  const handleGoogleSignIn = () => {
    dispatch(loginWithGoogle());
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Container maxW="lg" py={{ base: '12', md: '20' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading 
            size="lg"
            color={useColorModeValue('white', 'white')}
          >
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </Heading>
          <Text color="gray.400">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <Text
              as={RouterLink}
              to={mode === 'login' ? '/auth?mode=register' : '/auth?mode=login'}
              color="brand.500"
              fontWeight="semibold"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('gray.800', 'gray.800')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                {mode === 'register' && (
                  <FormControl isInvalid={!!displayNameError}>
                    <FormLabel htmlFor="displayName">Name</FormLabel>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      bg="gray.700"
                      border="1px solid"
                      borderColor="gray.600"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                    />
                    {displayNameError && (
                      <FormErrorMessage>{displayNameError}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
                <FormControl isInvalid={!!emailError}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                  />
                  {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={!!passwordError}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg="gray.700"
                      border="1px solid"
                      borderColor="gray.600"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        colorScheme="gray"
                        onClick={toggleShowPassword}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
                </FormControl>
              </Stack>
              
              {mode === 'login' && (
                <Box textAlign="right">
                  <Text
                    as={RouterLink}
                    to="/auth/forgot-password"
                    color="brand.500"
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    Forgot password?
                  </Text>
                </Box>
              )}
              
              <Stack spacing="6">
                <Button
                  type="submit"
                  variant="primary"
                  bg="brand.500"
                  _hover={{ bg: 'brand.600' }}
                  isLoading={isLoading}
                >
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </Button>
                
                <HStack>
                  <Divider borderColor="gray.600" />
                  <Text fontSize="sm" color="gray.500">OR</Text>
                  <Divider borderColor="gray.600" />
                </HStack>
                
                <Button
                  leftIcon={<FaGoogle />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  isLoading={isLoading}
                >
                  Continue with Google
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default AuthPage;