import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Radio,
  RadioGroup,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  IconButton,
  Tooltip,
  Select,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { 
  FaCamera, 
  FaArrowUp, 
  FaArrowDown, 
  FaArrowLeft, 
  FaArrowRight, 
  FaRedo, 
  FaSave, 
  FaSearch, 
  FaExpandArrowsAlt, 
  FaCompressArrowsAlt
} from 'react-icons/fa';

// Type for a storyboard frame with camera settings
interface StoryboardFrame {
  id: string;
  imageUrl: string;
  prompt?: string;
  order: number;
  cameraSettings?: {
    movement: 'none' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'tilt-up' | 'tilt-down' | 'track-in' | 'track-out' | 'rotate-cw' | 'rotate-ccw';
    intensity: number; // 0-100
    duration: number; // in seconds
  };
}

// Props for the CameraControls component
interface CameraControlsProps {
  storyboard: StoryboardFrame[];
  onChange: (frames: StoryboardFrame[]) => void;
}

// Movement types with their respective icons and descriptions
const movementTypes = [
  { value: 'none', label: 'Static', icon: FaCamera, description: 'No movement' },
  { value: 'pan-left', label: 'Pan Left', icon: FaArrowLeft, description: 'Move camera view left' },
  { value: 'pan-right', label: 'Pan Right', icon: FaArrowRight, description: 'Move camera view right' },
  { value: 'tilt-up', label: 'Tilt Up', icon: FaArrowUp, description: 'Move camera view up' },
  { value: 'tilt-down', label: 'Tilt Down', icon: FaArrowDown, description: 'Move camera view down' },
  { value: 'zoom-in', label: 'Zoom In', icon: FaExpandArrowsAlt, description: 'Zoom into the scene' },
  { value: 'zoom-out', label: 'Zoom Out', icon: FaCompressArrowsAlt, description: 'Zoom out from the scene' },
  { value: 'rotate-cw', label: 'Rotate CW', icon: FaRedo, description: 'Rotate clockwise' },
  { value: 'rotate-ccw', label: 'Rotate CCW', icon: FaRedo, description: 'Rotate counter-clockwise' },
];

// Main CameraControls component
const CameraControls: React.FC<CameraControlsProps> = ({ storyboard, onChange }) => {
  const [frames, setFrames] = useState<StoryboardFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Initialize frames when storyboard changes
  useEffect(() => {
    // Make sure all frames have camera settings initialized
    const initializedFrames = storyboard.map(frame => ({
      ...frame,
      cameraSettings: frame.cameraSettings || {
        movement: 'none',
        intensity: 50,
        duration: 3
      }
    }));
    
    setFrames(initializedFrames);
    
    // Set first frame as selected if available and no frame is currently selected
    if (initializedFrames.length > 0 && !selectedFrame) {
      setSelectedFrame(initializedFrames[0]);
    }
  }, [storyboard]);
  
  // Handle frame selection
  const handleSelectFrame = (frame: StoryboardFrame) => {
    setSelectedFrame(frame);
    onOpen();
  };
  
  // Handle movement type change
  const handleMovementChange = (value: string) => {
    if (!selectedFrame) return;
    
    const newFrames = frames.map(frame => {
      if (frame.id === selectedFrame.id) {
        return {
          ...frame,
          cameraSettings: {
            ...frame.cameraSettings!,
            movement: value as StoryboardFrame['cameraSettings']['movement']
          }
        };
      }
      return frame;
    });
    
    setFrames(newFrames);
    setSelectedFrame({
      ...selectedFrame,
      cameraSettings: {
        ...selectedFrame.cameraSettings!,
        movement: value as StoryboardFrame['cameraSettings']['movement']
      }
    });
  };
  
  // Handle intensity change
  const handleIntensityChange = (value: number) => {
    if (!selectedFrame) return;
    
    const newFrames = frames.map(frame => {
      if (frame.id === selectedFrame.id) {
        return {
          ...frame,
          cameraSettings: {
            ...frame.cameraSettings!,
            intensity: value
          }
        };
      }
      return frame;
    });
    
    setFrames(newFrames);
    setSelectedFrame({
      ...selectedFrame,
      cameraSettings: {
        ...selectedFrame.cameraSettings!,
        intensity: value
      }
    });
  };
  
  // Handle duration change
  const handleDurationChange = (value: string) => {
    if (!selectedFrame) return;
    const duration = parseInt(value, 10);
    
    const newFrames = frames.map(frame => {
      if (frame.id === selectedFrame.id) {
        return {
          ...frame,
          cameraSettings: {
            ...frame.cameraSettings!,
            duration: duration
          }
        };
      }
      return frame;
    });
    
    setFrames(newFrames);
    setSelectedFrame({
      ...selectedFrame,
      cameraSettings: {
        ...selectedFrame.cameraSettings!,
        duration: duration
      }
    });
  };
  
  // Save changes and notify parent component
  const handleSaveChanges = () => {
    onChange(frames);
    onClose();
  };
  
  // Apply the same camera settings to all frames
  const handleApplyToAll = () => {
    if (!selectedFrame || !selectedFrame.cameraSettings) return;
    
    const newFrames = frames.map(frame => ({
      ...frame,
      cameraSettings: { ...selectedFrame.cameraSettings! }
    }));
    
    setFrames(newFrames);
    onChange(newFrames);
    onClose();
  };
  
  // Get icon for a movement type
  const getMovementIcon = (movement: string) => {
    const found = movementTypes.find(type => type.value === movement);
    return found ? found.icon : FaCamera;
  };
  
  // Get label for a movement type
  const getMovementLabel = (movement: string) => {
    const found = movementTypes.find(type => type.value === movement);
    return found ? found.label : 'Static';
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Camera Movement Settings</Heading>
      <Text mb={6} color="gray.400">
        Configure camera movements for each frame of your video to create dynamic visual effects.
      </Text>
      
      {frames.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.700" borderRadius="md">
          <Text color="gray.400" mb={4}>No storyboard frames available</Text>
          <Text fontSize="sm" color="gray.500">
            Please create a storyboard in the previous step before configuring camera movements.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {frames.map((frame) => (
            <Box 
              key={frame.id} 
              bg="gray.700" 
              borderRadius="md" 
              overflow="hidden"
              cursor="pointer"
              onClick={() => handleSelectFrame(frame)}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              <Box position="relative">
                <Image 
                  src={frame.imageUrl} 
                  alt={`Frame ${frame.order}`} 
                  fallbackSrc="https://via.placeholder.com/300x200?text=Frame+Image"
                  width="100%"
                  height="160px"
                  objectFit="cover"
                />
                <Badge 
                  position="absolute" 
                  top={2} 
                  right={2}
                  colorScheme="blue"
                  borderRadius="full"
                  px={2}
                  py={1}
                >
                  Frame {frame.order}
                </Badge>
              </Box>
              
              <Box p={4}>
                <Flex alignItems="center" mb={2}>
                  <Box 
                    mr={2}
                    borderRadius="full"
                    bg={frame.cameraSettings?.movement === 'none' ? 'gray.600' : 'brand.500'} 
                    p={2}
                  >
                    {React.createElement(getMovementIcon(frame.cameraSettings?.movement || 'none'))}
                  </Box>
                  <Box>
                    <Text fontWeight="bold">{getMovementLabel(frame.cameraSettings?.movement || 'none')}</Text>
                    <Text fontSize="sm" color="gray.400">
                      Duration: {frame.cameraSettings?.duration || 3}s
                    </Text>
                  </Box>
                </Flex>
                
                <Box 
                  mt={2} 
                  fontSize="sm"
                  color="gray.400"
                  noOfLines={2}
                >
                  {frame.prompt || 'No prompt available'}
                </Box>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
      
      {/* Camera Settings Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>
            <Flex alignItems="center">
              <FaCamera />
              <Text ml={2}>Camera Settings - Frame {selectedFrame?.order}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedFrame && (
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <Box>
                  <Image 
                    src={selectedFrame.imageUrl} 
                    alt={`Frame ${selectedFrame.order}`} 
                    fallbackSrc="https://via.placeholder.com/300x200?text=Frame+Image"
                    width="100%"
                    maxHeight="300px"
                    objectFit="contain"
                    borderRadius="md"
                    mb={4}
                  />
                  
                  <Text fontSize="sm" color="gray.400" mb={4}>
                    {selectedFrame.prompt || 'No prompt available'}
                  </Text>
                </Box>
                
                <Box>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Text mb={2} fontWeight="medium">Movement Type</Text>
                      <RadioGroup 
                        onChange={handleMovementChange} 
                        value={selectedFrame.cameraSettings?.movement || 'none'}
                      >
                        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                          {movementTypes.map((type) => (
                            <Radio key={type.value} value={type.value} colorScheme="brand">
                              <Flex alignItems="center">
                                <Box mr={2}>
                                  {React.createElement(type.icon)}
                                </Box>
                                <Text>{type.label}</Text>
                              </Flex>
                            </Radio>
                          ))}
                        </SimpleGrid>
                      </RadioGroup>
                    </Box>
                    
                    <Box>
                      <Text mb={2} fontWeight="medium">Movement Intensity: {selectedFrame.cameraSettings?.intensity || 50}%</Text>
                      <Slider 
                        min={0} 
                        max={100} 
                        step={5}
                        value={selectedFrame.cameraSettings?.intensity || 50} 
                        onChange={handleIntensityChange}
                        isDisabled={selectedFrame.cameraSettings?.movement === 'none'}
                        colorScheme="brand"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Flex justifyContent="space-between" mt={1}>
                        <Text fontSize="xs" color="gray.500">Subtle</Text>
                        <Text fontSize="xs" color="gray.500">Dramatic</Text>
                      </Flex>
                    </Box>
                    
                    <Box>
                      <Text mb={2} fontWeight="medium">Duration</Text>
                      <Select 
                        value={selectedFrame.cameraSettings?.duration || 3} 
                        onChange={(e) => handleDurationChange(e.target.value)}
                        bg="gray.700"
                      >
                        <option value={3}>3 seconds</option>
                        <option value={5}>5 seconds</option>
                        <option value={7}>7 seconds</option>
                        <option value={9}>9 seconds</option>
                      </Select>
                    </Box>
                  </VStack>
                </Box>
              </Grid>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button 
              variant="outline" 
              mr={3} 
              onClick={handleApplyToAll}
            >
              Apply to All Frames
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
              leftIcon={<FaSave />}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CameraControls;