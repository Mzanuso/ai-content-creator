import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  IconButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';

// Popular keywords for suggestions
const POPULAR_KEYWORDS = [
  'Minimalist', 'Vintage', 'Modern', 'Retro', 'Cyberpunk',
  'Fantasy', 'Dark', 'Bright', 'Pastel', 'Monochrome',
  'Futuristic', 'Natural', 'Abstract', 'Geometric', 'Organic',
  'Cinematic', 'Anime', 'Watercolor', 'Oil Painting', 'Sketch',
  'Neon', 'Vaporwave', 'Realistic', 'Surreal', 'Corporate',
  'Professional', 'Playful', 'Elegant', 'Bold', 'Subtle'
];

// Related keywords suggestions (in real app, this would come from an API)
const RELATED_KEYWORDS: Record<string, string[]> = {
  'minimalist': ['Clean', 'Simple', 'Sleek', 'Uncluttered', 'Essential'],
  'vintage': ['Retro', 'Classic', 'Nostalgic', 'Old-school', 'Antique'],
  'modern': ['Contemporary', 'Sleek', 'Innovative', 'Trendy', 'Current'],
  'cyberpunk': ['Futuristic', 'Neon', 'Dystopian', 'Sci-fi', 'Digital'],
  'dark': ['Moody', 'Mysterious', 'Shadowy', 'Dramatic', 'Noir'],
  'bright': ['Colorful', 'Vivid', 'Cheerful', 'Vibrant', 'Lively'],
  'abstract': ['Non-representational', 'Conceptual', 'Non-objective', 'Experimental', 'Avant-garde'],
};

interface KeywordSelectorProps {
  selectedKeywords: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
  suggestedKeywords?: string[];
}

const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  selectedKeywords = [],
  onChange,
  maxKeywords = 3,
  suggestedKeywords = [],
}) => {
  const [inputValue, setInputValue] = useState('');
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  
  // Background colors for UI elements
  const boxBg = useColorModeValue('gray.700', 'gray.700');
  const cardBg = useColorModeValue('gray.800', 'gray.800');
  const activeBg = useColorModeValue('gray.600', 'gray.600');

  // Find related keywords based on current selection
  useEffect(() => {
    if (selectedKeywords.length > 0) {
      const lastKeyword = selectedKeywords[selectedKeywords.length - 1].toLowerCase();
      
      // Find matching related keywords
      const related = Object.entries(RELATED_KEYWORDS).find(
        ([key]) => key.toLowerCase() === lastKeyword
      );
      
      if (related) {
        // Filter out already selected keywords
        setRelatedKeywords(
          related[1].filter(
            (keyword) => !selectedKeywords.includes(keyword)
          )
        );
      } else {
        setRelatedKeywords([]);
      }
    } else {
      setRelatedKeywords([]);
    }
  }, [selectedKeywords]);

  const addKeyword = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim();
    
    if (trimmedKeyword && !selectedKeywords.includes(trimmedKeyword) && selectedKeywords.length < maxKeywords) {
      const newKeywords = [...selectedKeywords, trimmedKeyword];
      onChange(newKeywords);
      setInputValue('');
    }
  }, [selectedKeywords, onChange, maxKeywords]);

  const removeKeyword = useCallback((index: number) => {
    const newKeywords = selectedKeywords.filter((_, i) => i !== index);
    onChange(newKeywords);
  }, [selectedKeywords, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addKeyword(inputValue);
    }
  }, [inputValue, addKeyword]);

  // Filter suggestions to exclude already selected keywords
  const filteredSuggestions = POPULAR_KEYWORDS.filter(
    (keyword) => !selectedKeywords.includes(keyword)
  );

  // Show suggestions that match the current input if there's text
  const matchingSuggestions = inputValue
    ? filteredSuggestions.filter(
        (keyword) => keyword.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  return (
    <Box>
      <Heading size="md" mb={4}>Keywords</Heading>
      
      {/* Selected keywords display */}
      <Box mb={6} bg={boxBg} p={4} borderRadius="md">
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="medium">Selected Keywords ({selectedKeywords.length}/{maxKeywords})</Text>
        </Flex>
        
        {selectedKeywords.length > 0 ? (
          <Wrap spacing={2}>
            {selectedKeywords.map((keyword, index) => (
              <WrapItem key={index}>
                <Tag
                  size="lg"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="brand"
                >
                  <TagLabel>{keyword}</TagLabel>
                  <TagCloseButton onClick={() => removeKeyword(index)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Text color="gray.400" fontSize="sm">No keywords selected. Add up to {maxKeywords} keywords to define your style.</Text>
        )}
      </Box>
      
      {/* Keyword input */}
      <Box mb={6} bg={boxBg} p={4} borderRadius="md">
        <Text mb={2} fontWeight="medium">Add Keyword</Text>
        <Flex>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a keyword"
            bg="gray.700"
            mr={2}
          />
          <Button
            onClick={() => addKeyword(inputValue)}
            isDisabled={!inputValue.trim() || selectedKeywords.length >= maxKeywords}
            colorScheme="brand"
            leftIcon={<MdAdd />}
          >
            Add
          </Button>
        </Flex>
        
        {/* Show matching suggestions if there's input */}
        {inputValue && matchingSuggestions.length > 0 && (
          <Box mt={2}>
            <Text fontSize="sm" mb={1}>Suggestions:</Text>
            <Wrap spacing={2}>
              {matchingSuggestions.slice(0, 5).map((suggestion, index) => (
                <WrapItem key={index}>
                  <Tag
                    size="md"
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="blue"
                    cursor="pointer"
                    onClick={() => addKeyword(suggestion)}
                    _hover={{ bg: 'blue.600' }}
                  >
                    <TagLabel>{suggestion}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}
      </Box>
      
      {/* Related keywords based on selection */}
      {relatedKeywords.length > 0 && (
        <Box mb={6} bg={boxBg} p={4} borderRadius="md">
          <Text fontWeight="medium" mb={2}>Related to "{selectedKeywords[selectedKeywords.length - 1]}"</Text>
          <Wrap spacing={2}>
            {relatedKeywords.map((keyword, index) => (
              <WrapItem key={index}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="subtle"
                  colorScheme="purple"
                  cursor="pointer"
                  onClick={() => addKeyword(keyword)}
                  _hover={{ bg: 'purple.600' }}
                >
                  <TagLabel>{keyword}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      
      {/* Popular/suggested keywords */}
      <Box bg={boxBg} p={4} borderRadius="md">
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontWeight="medium">Popular Keywords</Text>
          <IconButton
            icon={isOpen ? <MdExpandLess /> : <MdExpandMore />}
            aria-label={isOpen ? "Collapse" : "Expand"}
            variant="ghost"
            size="sm"
            onClick={onToggle}
          />
        </Flex>
        
        <Collapse in={isOpen} animateOpacity>
          <Wrap spacing={2}>
            {/* First show any specifically suggested keywords */}
            {suggestedKeywords.length > 0 && (
              <>
                {suggestedKeywords
                  .filter(keyword => !selectedKeywords.includes(keyword))
                  .map((keyword, index) => (
                    <WrapItem key={`suggested-${index}`}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => addKeyword(keyword)}
                        _hover={{ bg: 'green.600' }}
                      >
                        <TagLabel>{keyword}</TagLabel>
                        <Badge ml={1} colorScheme="green" variant="solid" fontSize="2xs">
                          Suggested
                        </Badge>
                      </Tag>
                    </WrapItem>
                ))}
                <WrapItem>
                  <Box w="100%" h="1px" bg="gray.600" my={2} />
                </WrapItem>
              </>
            )}
            
            {/* Then show popular keywords */}
            {filteredSuggestions.slice(0, 20).map((keyword, index) => (
              <WrapItem key={index}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="subtle"
                  colorScheme="gray"
                  cursor="pointer"
                  onClick={() => addKeyword(keyword)}
                  _hover={{ bg: 'gray.600' }}
                >
                  <TagLabel>{keyword}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Collapse>
      </Box>
    </Box>
  );
};

export default KeywordSelector;