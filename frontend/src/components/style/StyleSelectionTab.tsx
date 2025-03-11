import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  VStack,
  HStack,
  useToast,
  Divider,
  Select,
  Icon,
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import { MdSave, MdRefresh, MdAspectRatio } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { updateProject } from '../../features/projects/projectSlice';
import { Style } from '../../features/styles/styleSlice';

// Style components
import ColorPicker from './ColorPicker';
import KeywordSelector from './KeywordSelector';
import StyleGallery from './StyleGallery';

interface StyleSelectionTabProps {
  projectId: string;
  initialStyleData?: {
    srefCode?: string;
    keywords?: string[];
    colorPalette?: string[];
  };
  onStyleDataChange?: (styleData: any) => void;
}

const StyleSelectionTab: React.FC<StyleSelectionTabProps> = ({
  projectId,
  initialStyleData = {},
  onStyleDataChange,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { currentProject, isLoading } = useAppSelector((state) => state.projects);
  
  // State for form values
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(initialStyleData.keywords || []);
  const [colorPalette, setColorPalette] = useState<string[]>(initialStyleData.colorPalette || []);
  const [aspectRatio, setAspectRatio] = useState<string>(currentProject?.aspectRatio || '16:9');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Background colors for UI elements
  const boxBg = useColorModeValue('gray.700', 'gray.700');
  
  // Update local state when initialStyleData changes
  useEffect(() => {
    if (initialStyleData) {
      if (initialStyleData.keywords) {
        setSelectedKeywords(initialStyleData.keywords);
      }
      if (initialStyleData.colorPalette) {
        setColorPalette(initialStyleData.colorPalette);
      }
      // We'll fetch and set the style in another useEffect below
    }
  }, [initialStyleData]);
  
  // Track changes
  useEffect(() => {
    const initialSref = initialStyleData.srefCode || '';
    const currentSref = selectedStyle?.srefCode || '';
    
    const initialKeywords = initialStyleData.keywords || [];
    const initialColors = initialStyleData.colorPalette || [];
    
    const keywordsChanged = 
      selectedKeywords.length !== initialKeywords.length ||
      selectedKeywords.some(kw => !initialKeywords.includes(kw));
    
    const colorsChanged = 
      colorPalette.length !== initialColors.length ||
      colorPalette.some(color => !initialColors.includes(color));
    
    const styleChanged = initialSref !== currentSref;
    const aspectRatioChanged = aspectRatio !== (currentProject?.aspectRatio || '16:9');
    
    setHasChanges(keywordsChanged || colorsChanged || styleChanged || aspectRatioChanged);
    
    // Call onStyleDataChange callback if provided
    if (onStyleDataChange) {
      onStyleDataChange({
        srefCode: selectedStyle?.srefCode,
        keywords: selectedKeywords,
        colorPalette: colorPalette,
      });
    }
  }, [selectedStyle, selectedKeywords, colorPalette, aspectRatio, initialStyleData, currentProject, onStyleDataChange]);
  
  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    
    // If style has recommended keywords, suggest them if user hasn't selected any yet
    if (style.recommendedKeywords && style.recommendedKeywords.length > 0 && selectedKeywords.length === 0) {
      // Take up to 3 keywords from the recommended list
      setSelectedKeywords(style.recommendedKeywords.slice(0, 3));
    }
  };
  
  const handleSaveChanges = async () => {
    if (!currentProject) return;
    
    const styleData = {
      srefCode: selectedStyle?.srefCode || '',
      keywords: selectedKeywords,
      colorPalette: colorPalette,
    };
    
    try {
      // In a real app, dispatch an action to update the project
      await dispatch(updateProject({
        id: projectId,
        styleData,
        aspectRatio,
        status: 'in-progress',
      }));
      
      toast({
        title: 'Style settings saved',
        description: 'Style preferences have been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Error saving style settings',
        description: 'An error occurred while saving your style preferences.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const resetChanges = () => {
    setSelectedKeywords(initialStyleData.keywords || []);
    setColorPalette(initialStyleData.colorPalette || []);
    setAspectRatio(currentProject?.aspectRatio || '16:9');
    setSelectedStyle(null); // This will need to be updated to fetch the style by srefCode
    setHasChanges(false);
  };
  
  return (
    <Box>
      {/* Header with save button */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Style Selection</Heading>
        <HStack>
          <Button
            variant="outline"
            leftIcon={<MdRefresh />}
            onClick={resetChanges}
            isDisabled={!hasChanges || isLoading}
          >
            Reset Changes
          </Button>
          <Button
            colorScheme="brand"
            leftIcon={<MdSave />}
            onClick={handleSaveChanges}
            isLoading={isLoading}
            isDisabled={!hasChanges}
          >
            Save Changes
          </Button>
        </HStack>
      </Flex>
      
      {/* Video Settings */}
      <Box mb={8} bg={boxBg} p={6} borderRadius="md">
        <Heading size="sm" mb={4}>Video Settings</Heading>
        <FormControl>
          <FormLabel>Aspect Ratio</FormLabel>
          <HStack spacing={4}>
            <Select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              maxW="200px"
              bg="gray.700"
              icon={<MdAspectRatio />}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:3">4:3 (Traditional)</option>
              <option value="21:9">21:9 (Cinematic)</option>
            </Select>
            
            {/* Aspect ratio preview */}
            <Flex align="center" justify="center">
              {aspectRatio === '16:9' && (
                <Box w="160px" h="90px" bg="gray.600" borderRadius="md" border="1px solid" borderColor="gray.500" />
              )}
              {aspectRatio === '9:16' && (
                <Box w="90px" h="160px" bg="gray.600" borderRadius="md" border="1px solid" borderColor="gray.500" />
              )}
              {aspectRatio === '1:1' && (
                <Box w="120px" h="120px" bg="gray.600" borderRadius="md" border="1px solid" borderColor="gray.500" />
              )}
              {aspectRatio === '4:3' && (
                <Box w="160px" h="120px" bg="gray.600" borderRadius="md" border="1px solid" borderColor="gray.500" />
              )}
              {aspectRatio === '21:9' && (
                <Box w="189px" h="90px" bg="gray.600" borderRadius="md" border="1px solid" borderColor="gray.500" />
              )}
            </Flex>
          </HStack>
        </FormControl>
      </Box>
      
      {/* Main content grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Left column for style gallery */}
        <VStack align="stretch" spacing={6}>
          <StyleGallery
            onStyleSelect={handleStyleSelect}
            selectedStyleCode={selectedStyle?.srefCode}
          />
        </VStack>
        
        {/* Right column for color picker and keywords */}
        <VStack align="stretch" spacing={6}>
          <ColorPicker
            colorPalette={colorPalette}
            onChange={setColorPalette}
          />
          
          <Divider borderColor="gray.600" />
          
          <KeywordSelector
            selectedKeywords={selectedKeywords}
            onChange={setSelectedKeywords}
            suggestedKeywords={selectedStyle?.recommendedKeywords}
          />
        </VStack>
      </SimpleGrid>
      
      {/* Footer with save button (for long pages) */}
      {hasChanges && (
        <Flex justify="flex-end" mt={8}>
          <Button
            colorScheme="brand"
            leftIcon={<MdSave />}
            onClick={handleSaveChanges}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default StyleSelectionTab;