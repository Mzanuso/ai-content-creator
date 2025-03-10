import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaHome, FaArrowRight } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxW="container.lg" py={20}>
      <VStack spacing={10} textAlign="center">
        <Heading as="h1" size="4xl" fontWeight="bold" letterSpacing="wider">
          404
        </Heading>
        
        <VStack spacing={4}>
          <Heading as="h2" size="xl">
            Page Not Found
          </Heading>
          <Text fontSize="lg" color="gray.400" maxW="2xl">
            Oops! It seems the page you're looking for has been lost in the digital void. 
            Perhaps it was never created, or maybe it's still waiting for an AI to generate it.
          </Text>
        </VStack>
        
        <Box pt={6}>
          <Button
            as={RouterLink}
            to="/"
            size="lg"
            colorScheme="brand"
            leftIcon={<FaHome />}
            mr={4}
          >
            Go Home
          </Button>
          <Button
            as={RouterLink}
            to="/dashboard"
            size="lg"
            variant="outline"
            rightIcon={<FaArrowRight />}
          >
            Go to Dashboard
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default NotFoundPage;