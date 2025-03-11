import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  VStack,
  Text,
  useToast,
  HStack,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FaLightbulb, FaRandom, FaMagic } from 'react-icons/fa';

interface ConceptInputProps {
  initialConcept?: string;
  onConceptSubmit: (concept: string) => void;
  isLoading?: boolean;
  styleKeywords?: string[];
}

const MAX_CONCEPT_LENGTH = 200;

// Some example concepts to inspire users
const EXAMPLE_CONCEPTS = [
  "A busy professional discovers the power of mindfulness and transforms their chaotic life",
  "An AI assistant helps an elderly person reconnect with long-lost family members",
  "A sustainable product that revolutionizes how we conserve water in daily life",
  "The journey of a food delivery service that empowers local immigrant chefs",
  "How blockchain technology can make supply chains more transparent and ethical"
];

const ConceptInput: React.FC<ConceptInputProps> = ({
  initialConcept = '',
  onConceptSubmit,
  isLoading = false,
  styleKeywords = [],
}) => {
  const [concept, setConcept] = useState(initialConcept);
  const [showExamples, setShowExamples] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (initialConcept !== concept && initialConcept !== '') {
      setConcept(initialConcept);
    }
  }, [initialConcept]);

  const handleSubmit = () => {
    if (concept.trim().length < 10) {
      toast({
        title: 'Concept too short',
        description: 'Please enter a concept with at least 10 characters to get meaningful results.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    onConceptSubmit(concept);
  };

  const handleRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_CONCEPTS.length);
    setConcept(EXAMPLE_CONCEPTS[randomIndex]);
  };

  const charactersRemaining = MAX_CONCEPT_LENGTH - concept.length;
  const isCharacterLimitExceeded = charactersRemaining < 0;

  return (
    <Box bg="gray.800" p={6} borderRadius="md" w="100%">
      <VStack spacing={4} align="start" w="100%">
        <FormControl isInvalid={isCharacterLimitExceeded}>
          <FormLabel fontSize="lg" fontWeight="bold">
            Enter Your Video Concept
          </FormLabel>
          <FormHelperText mb={2}>
            Describe the core idea or message of your video in 1-2 sentences (max 200 characters).
            This will be used to generate your screenplay.
          </FormHelperText>

          <Textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Example: A product showcase that highlights how our noise-cancelling headphones combine comfort with cutting-edge technology"
            size="lg"
            rows={4}
            bg="gray.700"
            maxLength={MAX_CONCEPT_LENGTH}
          />

          <Flex justify="space-between" mt={2}>
            <Text fontSize="sm" color={isCharacterLimitExceeded ? "red.500" : "gray.400"}>
              {charactersRemaining} characters remaining
            </Text>
            
            <HStack>
              <Tooltip label="Get inspired with a random example">
                <IconButton
                  aria-label="Random example"
                  icon={<FaRandom />}
                  size="sm"
                  variant="ghost"
                  onClick={handleRandomExample}
                />
              </Tooltip>
              <Tooltip label="Show examples">
                <IconButton
                  aria-label="Show examples"
                  icon={<FaLightbulb />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowExamples(!showExamples)}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </FormControl>

        {/* Style keywords suggestions */}
        {styleKeywords && styleKeywords.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Consider incorporating your selected style keywords:
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {styleKeywords.map((keyword) => (
                <Badge 
                  key={keyword} 
                  colorScheme="brand" 
                  px={2} 
                  py={1} 
                  borderRadius="full"
                  cursor="pointer"
                  onClick={() => {
                    if (!concept.toLowerCase().includes(keyword.toLowerCase())) {
                      setConcept((prev) => `${prev}${prev ? ' ' : ''}${keyword}`);
                    }
                  }}
                >
                  {keyword}
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        {/* Example concepts */}
        {showExamples && (
          <Box bg="gray.700" p={4} borderRadius="md" w="100%">
            <Text fontWeight="medium" mb={2}>Example Concepts:</Text>
            <VStack align="start" spacing={2}>
              {EXAMPLE_CONCEPTS.map((ex, index) => (
                <Text 
                  key={index}
                  fontSize="sm"
                  color="gray.300"
                  cursor="pointer"
                  _hover={{ color: 'brand.300' }}
                  onClick={() => setConcept(ex)}
                >
                  {ex}
                </Text>
              ))}
            </VStack>
          </Box>
        )}

        <Flex w="100%" justify="center" mt={4}>
          <Button
            leftIcon={<FaMagic />}
            colorScheme="brand"
            size="lg"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Generating Screenplay..."
            isDisabled={concept.trim().length < 10 || isCharacterLimitExceeded}
            px={10}
          >
            Generate Screenplay
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ConceptInput;
