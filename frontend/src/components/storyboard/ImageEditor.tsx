import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  IconButton,
  Box,
  Image,
  Flex,
  VStack,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormLabel,
  Input,
  Textarea,
  Grid,
  Select,
  Divider,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  MdSave,
  MdUndo,
  MdRedo,
  MdRotateLeft,
  MdRotateRight,
  MdCrop,
  MdFlip,
  MdColorize,
  MdFilterVintage,
  MdTune,
  MdDelete,
  MdCached,
  MdBrush,
  MdLens,
} from 'react-icons/md';
import { GeneratedImage } from '../../features/ai/aiSlice';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage;
  onSave: (updatedImage: GeneratedImage) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  image,
  onSave,
}) => {
  const toast = useToast();
  // For a real implementation, we would use a canvas or an image editing library
  // But for this demo, we'll just simulate the editing experience
  
  // Local state
  const [currentImage, setCurrentImage] = useState<string>(image.url);
  const [originalImage] = useState<string>(image.url);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [inpaintingPrompt, setInpaintingPrompt] = useState('');
  const [outpaintingPrompt, setOutpaintingPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  
  // Create references for the image container and image element
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset state when image changes
  useEffect(() => {
    setCurrentImage(image.url);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setInpaintingPrompt('');
    setOutpaintingPrompt('');
    setIsProcessing(false);
    setSelectedFilter('none');
  }, [image]);
  
  // Apply basic image adjustments (this would be an actual image transformation in a real app)
  const applyAdjustments = () => {
    // In a real implementation, we would apply the adjustments to the image
    // For demo purposes, just show a toast
    toast({
      title: 'Adjustments Applied',
      description: `Brightness: ${brightness}%, Contrast: ${contrast}%, Saturation: ${saturation}%`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Apply filter
  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);
    
    // In a real implementation, we would apply the filter to the image
    // For demo purposes, just show a toast
    toast({
      title: 'Filter Applied',
      description: `Applied ${filter} filter`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Perform inpainting (removing objects)
  const performInpainting = () => {
    if (!inpaintingPrompt) {
      toast({
        title: 'Missing prompt',
        description: 'Please enter what you want to remove',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // In a real implementation, we would send the image and prompt to the inpainting API
      toast({
        title: 'Inpainting Completed',
        description: `Removed "${inpaintingPrompt}" from the image`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsProcessing(false);
    }, 2000);
  };
  
  // Perform outpainting (extending image)
  const performOutpainting = () => {
    if (!outpaintingPrompt) {
      toast({
        title: 'Missing prompt',
        description: 'Please enter how you want to extend the image',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // In a real implementation, we would send the image and prompt to the outpainting API
      toast({
        title: 'Outpainting Completed',
        description: `Extended image with "${outpaintingPrompt}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsProcessing(false);
    }, 2000);
  };
  
  // Reset to original image
  const resetImage = () => {
    setCurrentImage(originalImage);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSelectedFilter('none');
    
    toast({
      title: 'Image Reset',
      description: 'All changes have been reverted to the original image',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Save edited image
  const handleSave = () => {
    // In a real implementation, we would save the edited image
    // For demo purposes, just call onSave with updated image info
    const updatedImage: GeneratedImage = {
      ...image,
      // In a real app, we would generate a new URL for the edited image
      url: currentImage,
    };
    
    onSave(updatedImage);
    onClose();
    
    toast({
      title: 'Image Saved',
      description: 'Your edited image has been saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent bg="gray.800" maxH="90vh">
        <ModalHeader>Image Editor</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
            {/* Image Preview Area */}
            <Box 
              flex="3" 
              bg="gray.900" 
              borderRadius="md" 
              p={4}
              minH="400px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              ref={imageContainerRef}
            >
              <Box position="relative" maxW="100%" maxH="70vh" overflow="hidden">
                <Image 
                  src={currentImage} 
                  alt="Editing preview" 
                  maxW="100%" 
                  maxH="70vh"
                  objectFit="contain"
                  filter={
                    selectedFilter === 'none' ? 'none' :
                    selectedFilter === 'grayscale' ? 'grayscale(100%)' :
                    selectedFilter === 'sepia' ? 'sepia(70%)' :
                    selectedFilter === 'vintage' ? 'sepia(30%) contrast(110%) brightness(90%)' :
                    selectedFilter === 'cinematic' ? 'contrast(120%) saturate(110%) brightness(90%)' :
                    'none'
                  }
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  }}
                />
              </Box>
            </Box>
            
            {/* Controls Area */}
            <Box flex="2">
              <Tabs colorScheme="brand" variant="enclosed" size="sm">
                <TabList>
                  <Tab>Adjustments</Tab>
                  <Tab>Filters</Tab>
                  <Tab>AI Tools</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Basic Adjustments Panel */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <FormLabel htmlFor="brightness">Brightness: {brightness}%</FormLabel>
                        <Slider 
                          id="brightness" 
                          min={0} 
                          max={200} 
                          step={1}
                          value={brightness}
                          onChange={setBrightness}
                          colorScheme="brand"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <Box>
                        <FormLabel htmlFor="contrast">Contrast: {contrast}%</FormLabel>
                        <Slider 
                          id="contrast" 
                          min={0} 
                          max={200} 
                          step={1}
                          value={contrast}
                          onChange={setContrast}
                          colorScheme="brand"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <Box>
                        <FormLabel htmlFor="saturation">Saturation: {saturation}%</FormLabel>
                        <Slider 
                          id="saturation" 
                          min={0} 
                          max={200} 
                          step={1}
                          value={saturation}
                          onChange={setSaturation}
                          colorScheme="brand"
                        >
                          <SliderTrack>
                            <SliderFilledTrack />
                          </SliderTrack>
                          <SliderThumb />
                        </Slider>
                      </Box>
                      
                      <Divider borderColor="gray.600" />
                      
                      <HStack spacing={4} justify="center">
                        <Tooltip label="Rotate Left">
                          <IconButton
                            aria-label="Rotate Left"
                            icon={<MdRotateLeft />}
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label="Rotate Right">
                          <IconButton
                            aria-label="Rotate Right"
                            icon={<MdRotateRight />}
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label="Flip">
                          <IconButton
                            aria-label="Flip"
                            icon={<MdFlip />}
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label="Crop">
                          <IconButton
                            aria-label="Crop"
                            icon={<MdCrop />}
                            variant="outline"
                          />
                        </Tooltip>
                      </HStack>
                      
                      <Button
                        colorScheme="brand"
                        onClick={applyAdjustments}
                        leftIcon={<MdTune />}
                      >
                        Apply Adjustments
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Filters Panel */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Text fontWeight="medium">Select a Filter</Text>
                      
                      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <VStack 
                          spacing={2} 
                          p={2} 
                          borderRadius="md" 
                          borderWidth="2px"
                          borderColor={selectedFilter === 'none' ? 'brand.500' : 'transparent'}
                          onClick={() => applyFilter('none')}
                          cursor="pointer"
                          _hover={{ bg: 'gray.700' }}
                        >
                          <Box 
                            w="100%" 
                            h="60px" 
                            bg="gray.600" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <Image 
                              src={originalImage} 
                              alt="None" 
                              w="100%" 
                              h="100%" 
                              objectFit="cover" 
                            />
                          </Box>
                          <Text fontSize="sm">None</Text>
                        </VStack>
                        
                        <VStack 
                          spacing={2} 
                          p={2} 
                          borderRadius="md" 
                          borderWidth="2px"
                          borderColor={selectedFilter === 'grayscale' ? 'brand.500' : 'transparent'}
                          onClick={() => applyFilter('grayscale')}
                          cursor="pointer"
                          _hover={{ bg: 'gray.700' }}
                        >
                          <Box 
                            w="100%" 
                            h="60px" 
                            bg="gray.600" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <Image 
                              src={originalImage} 
                              alt="Grayscale" 
                              w="100%" 
                              h="100%" 
                              objectFit="cover" 
                              filter="grayscale(100%)"
                            />
                          </Box>
                          <Text fontSize="sm">Grayscale</Text>
                        </VStack>
                        
                        <VStack 
                          spacing={2} 
                          p={2} 
                          borderRadius="md" 
                          borderWidth="2px"
                          borderColor={selectedFilter === 'sepia' ? 'brand.500' : 'transparent'}
                          onClick={() => applyFilter('sepia')}
                          cursor="pointer"
                          _hover={{ bg: 'gray.700' }}
                        >
                          <Box 
                            w="100%" 
                            h="60px" 
                            bg="gray.600" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <Image 
                              src={originalImage} 
                              alt="Sepia" 
                              w="100%" 
                              h="100%" 
                              objectFit="cover" 
                              filter="sepia(70%)"
                            />
                          </Box>
                          <Text fontSize="sm">Sepia</Text>
                        </VStack>
                        
                        <VStack 
                          spacing={2} 
                          p={2} 
                          borderRadius="md" 
                          borderWidth="2px"
                          borderColor={selectedFilter === 'vintage' ? 'brand.500' : 'transparent'}
                          onClick={() => applyFilter('vintage')}
                          cursor="pointer"
                          _hover={{ bg: 'gray.700' }}
                        >
                          <Box 
                            w="100%" 
                            h="60px" 
                            bg="gray.600" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <Image 
                              src={originalImage} 
                              alt="Vintage" 
                              w="100%" 
                              h="100%" 
                              objectFit="cover" 
                              filter="sepia(30%) contrast(110%) brightness(90%)"
                            />
                          </Box>
                          <Text fontSize="sm">Vintage</Text>
                        </VStack>
                        
                        <VStack 
                          spacing={2} 
                          p={2} 
                          borderRadius="md" 
                          borderWidth="2px"
                          borderColor={selectedFilter === 'cinematic' ? 'brand.500' : 'transparent'}
                          onClick={() => applyFilter('cinematic')}
                          cursor="pointer"
                          _hover={{ bg: 'gray.700' }}
                        >
                          <Box 
                            w="100%" 
                            h="60px" 
                            bg="gray.600" 
                            borderRadius="md" 
                            overflow="hidden"
                          >
                            <Image 
                              src={originalImage} 
                              alt="Cinematic" 
                              w="100%" 
                              h="100%" 
                              objectFit="cover" 
                              filter="contrast(120%) saturate(110%) brightness(90%)"
                            />
                          </Box>
                          <Text fontSize="sm">Cinematic</Text>
                        </VStack>
                      </Grid>
                    </VStack>
                  </TabPanel>
                  
                  {/* AI Tools Panel */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Inpainting (Remove Objects) */}
                      <Box p={4} bg="gray.700" borderRadius="md">
                        <Text fontWeight="medium" mb={2} color="brand.300">
                          <MdDelete /> Inpainting (Remove Objects)
                        </Text>
                        <Text fontSize="sm" mb={3}>
                          Describe what you want to remove from the image.
                        </Text>
                        <Textarea
                          placeholder="E.g., 'Remove the car in the background'"
                          value={inpaintingPrompt}
                          onChange={(e) => setInpaintingPrompt(e.target.value)}
                          mb={3}
                          bg="gray.800"
                        />
                        <Button
                          colorScheme="red"
                          leftIcon={<MdDelete />}
                          onClick={performInpainting}
                          isLoading={isProcessing}
                          isDisabled={!inpaintingPrompt}
                          width="full"
                        >
                          Remove Objects
                        </Button>
                      </Box>
                      
                      {/* Outpainting (Extend Image) */}
                      <Box p={4} bg="gray.700" borderRadius="md">
                        <Text fontWeight="medium" mb={2} color="brand.300">
                          <MdBrush /> Outpainting (Extend Image)
                        </Text>
                        <Text fontSize="sm" mb={3}>
                          Describe how you want to expand the image.
                        </Text>
                        <Textarea
                          placeholder="E.g., 'Extend to show more of the beach'"
                          value={outpaintingPrompt}
                          onChange={(e) => setOutpaintingPrompt(e.target.value)}
                          mb={3}
                          bg="gray.800"
                        />
                        <Button
                          colorScheme="blue"
                          leftIcon={<MdBrush />}
                          onClick={performOutpainting}
                          isLoading={isProcessing}
                          isDisabled={!outpaintingPrompt}
                          width="full"
                        >
                          Extend Image
                        </Button>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Flex>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="outline" 
            mr={3} 
            leftIcon={<MdCached />}
            onClick={resetImage}
          >
            Reset All
          </Button>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            leftIcon={<MdSave />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageEditor;
