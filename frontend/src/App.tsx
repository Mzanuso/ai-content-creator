import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Heading, Text, Container, Button, VStack } from '@chakra-ui/react';

const App: React.FC = () => {
  return (
    <Box as="main" minH="100vh" bg="gray.900" color="white">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={10} textAlign="center">
          <Heading size="2xl">AI Content Creator</Heading>
          <Text fontSize="xl">
            An AI-powered platform for creating professional video content through a guided creative workflow.
          </Text>
          <Button colorScheme="blue" size="lg">
            Get Started
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default App;