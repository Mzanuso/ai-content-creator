import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  Image,
  Badge,
  useColorModeValue,
  Skeleton,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Tag,
  TagLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { MdSearch, MdFilterList, MdCheckCircle } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { Style, StyleCategory, filterStyles, setSelectedStyle, fetchStyles } from '../../features/styles/styleSlice';

// Mock data for development - will be replaced by actual API data
const MOCK_STYLES: Style[] = [
  {
    srefCode: 'minimalist-01',
    name: 'Minimalist',
    description: 'Clean, simple designs with minimal elements and neutral colors.',
    category: 'Modern',
    tags: ['Clean', 'Simple', 'Elegant'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Minimalist',
    recommendedKeywords: ['Minimal', 'Clean', 'Simple', 'White Space'],
  },
  {
    srefCode: 'cyberpunk-01',
    name: 'Cyberpunk',
    description: 'Futuristic urban settings with neon lights and high-tech elements.',
    category: 'Sci-Fi',
    tags: ['Future', 'Neon', 'Urban'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Cyberpunk',
    recommendedKeywords: ['Futuristic', 'Neon', 'Tech', 'Urban'],
  },
  {
    srefCode: 'vintage-01',
    name: 'Vintage',
    description: 'Classic style with aged appearance and nostalgic elements.',
    category: 'Retro',
    tags: ['Classic', 'Retro', 'Old-school'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Vintage',
    recommendedKeywords: ['Retro', 'Classic', 'Nostalgic', 'Aged'],
  },
  {
    srefCode: 'abstract-01',
    name: 'Abstract',
    description: 'Non-representational style using shapes, forms, and colors.',
    category: 'Artistic',
    tags: ['Artistic', 'Conceptual', 'Shapes'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Abstract',
    recommendedKeywords: ['Conceptual', 'Shapes', 'Experimental'],
  },
  {
    srefCode: 'corporate-01',
    name: 'Corporate',
    description: 'Professional style for business and corporate communications.',
    category: 'Business',
    tags: ['Professional', 'Business', 'Clean'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Corporate',
    recommendedKeywords: ['Professional', 'Business', 'Formal'],
  },
  {
    srefCode: 'nature-01',
    name: 'Nature',
    description: 'Organic style inspired by natural elements and landscapes.',
    category: 'Organic',
    tags: ['Organic', 'Natural', 'Green'],
    previewUrl: 'https://via.placeholder.com/300x200?text=Nature',
    recommendedKeywords: ['Organic', 'Green', 'Natural', 'Landscape'],
  },
];

const MOCK_CATEGORIES: StyleCategory[] = [
  { name: 'All', count: MOCK_STYLES.length },
  { name: 'Modern', count: 1 },
  { name: 'Sci-Fi', count: 1 },
  { name: 'Retro', count: 1 },
  { name: 'Artistic', count: 1 },
  { name: 'Business', count: 1 },
  { name: 'Organic', count: 1 },
];

interface StyleGalleryProps {
  onStyleSelect: (style: Style) => void;
  selectedStyleCode?: string;
}

const StyleGallery: React.FC<StyleGalleryProps> = ({ 
  onStyleSelect,
  selectedStyleCode
}) => {
  const dispatch = useAppDispatch();
  const { styles, filteredStyles, categories, isLoading, error } = useAppSelector(
    (state) => state.styles
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewStyle, setPreviewStyle] = useState<Style | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Background colors for UI elements
  const boxBg = useColorModeValue('gray.700', 'gray.700');
  const cardBg = useColorModeValue('gray.800', 'gray.800');
  
  // Fetch styles on component mount
  useEffect(() => {
    // For development, use mock data
    // In production, we would dispatch(fetchStyles())
    if (styles.length === 0 && !isLoading) {
      dispatch({ type: 'styles/setMockStyles', payload: MOCK_STYLES });
    }
  }, [dispatch, styles.length, isLoading]);
  
  // Apply filters when search term or category changes
  useEffect(() => {
    const filters: { category?: string; keyword?: string } = {};
    
    if (selectedCategory !== 'All') {
      filters.category = selectedCategory;
    }
    
    if (searchTerm) {
      filters.keyword = searchTerm;
    }
    
    dispatch(filterStyles(filters));
  }, [dispatch, searchTerm, selectedCategory]);
  
  const handleStyleSelect = (style: Style) => {
    onStyleSelect(style);
    dispatch(setSelectedStyle(style));
  };
  
  const openPreview = (style: Style) => {
    setPreviewStyle(style);
    onOpen();
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Style Gallery</Heading>
      
      {/* Search and filters */}
      <Flex mb={6} bg={boxBg} p={4} borderRadius="md" direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup flex={{ base: '1', md: '2' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search styles"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="gray.700"
          />
        </InputGroup>
        
        <Flex align="center" gap={2}>
          <Icon as={MdFilterList} color="gray.400" />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            bg="gray.700"
            maxW={{ base: 'full', md: '200px' }}
          >
            {categories.map((category, index) => (
              <option key={index} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>
      
      {/* Style gallery grid */}
      {isLoading ? (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {[...Array(6)].map((_, index) => (
            <Box key={index} bg={cardBg} borderRadius="md" overflow="hidden">
              <Skeleton height="200px" />
              <Box p={4}>
                <Skeleton height="20px" width="80%" mb={2} />
                <Skeleton height="15px" mb={1} />
                <Skeleton height="15px" width="90%" />
              </Box>
            </Box>
          ))}
        </Grid>
      ) : filteredStyles.length > 0 ? (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {filteredStyles.map((style) => (
            <Box
              key={style.srefCode}
              bg={cardBg}
              borderRadius="md"
              overflow="hidden"
              cursor="pointer"
              position="relative"
              boxShadow={selectedStyleCode === style.srefCode ? '0 0 0 2px #1f8de6' : 'none'}
              _hover={{ transform: 'translateY(-4px)', transition: 'transform 0.3s ease' }}
              onClick={() => handleStyleSelect(style)}
            >
              {/* Style preview image */}
              <Box position="relative" h="200px">
                <Image
                  src={style.previewUrl || 'https://via.placeholder.com/300x200?text=No+Preview'}
                  alt={style.name}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
                
                {/* Selected indicator */}
                {selectedStyleCode === style.srefCode && (
                  <Flex
                    position="absolute"
                    top={0}
                    right={0}
                    bg="brand.500"
                    color="white"
                    p={2}
                    align="center"
                    borderBottomLeftRadius="md"
                  >
                    <Icon as={MdCheckCircle} mr={1} />
                    <Text fontWeight="bold" fontSize="sm">Selected</Text>
                  </Flex>
                )}
                
                {/* Category badge */}
                <Badge
                  position="absolute"
                  top={2}
                  left={2}
                  colorScheme="blue"
                  fontSize="xs"
                >
                  {style.category}
                </Badge>
              </Box>
              
              {/* Style info */}
              <Box p={4}>
                <Heading size="sm" mb={1}>{style.name}</Heading>
                <Text fontSize="sm" color="gray.400" noOfLines={2} mb={3}>
                  {style.description}
                </Text>
                
                {/* Tags */}
                <HStack spacing={2} flexWrap="wrap">
                  {style.tags?.slice(0, 3).map((tag, index) => (
                    <Tag key={index} size="sm" colorScheme="gray" mb={1}>
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
                
                {/* Action buttons */}
                <HStack mt={3} spacing={2} justify="flex-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(style);
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="brand"
                    variant={selectedStyleCode === style.srefCode ? 'solid' : 'outline'}
                  >
                    {selectedStyleCode === style.srefCode ? 'Selected' : 'Select'}
                  </Button>
                </HStack>
              </Box>
            </Box>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" p={8} bg={boxBg} borderRadius="md">
          <Text fontSize="lg" mb={2}>No styles found</Text>
          <Text color="gray.400">
            Try adjusting your search criteria or category filters.
          </Text>
        </Box>
      )}
      
      {/* Style preview modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>{previewStyle?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewStyle && (
              <Box>
                <Image
                  src={previewStyle.previewUrl || 'https://via.placeholder.com/600x400?text=No+Preview'}
                  alt={previewStyle.name}
                  borderRadius="md"
                  mb={4}
                  w="100%"
                />
                
                <Text mb={4}>{previewStyle.description}</Text>
                
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Category</Heading>
                  <Badge colorScheme="blue">{previewStyle.category}</Badge>
                </Box>
                
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Tags</Heading>
                  <HStack spacing={2} flexWrap="wrap">
                    {previewStyle.tags?.map((tag, index) => (
                      <Tag key={index} colorScheme="gray">
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>
                
                <Box>
                  <Heading size="sm" mb={2}>Recommended Keywords</Heading>
                  <HStack spacing={2} flexWrap="wrap">
                    {previewStyle.recommendedKeywords?.map((keyword, index) => (
                      <Tag key={index} colorScheme="green">
                        <TagLabel>{keyword}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={() => {
                if (previewStyle) {
                  handleStyleSelect(previewStyle);
                  onClose();
                }
              }}
            >
              Select Style
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StyleGallery;