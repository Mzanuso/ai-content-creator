import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  HStack,
  VStack,
  Flex,
  Heading,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { 
  MdPhotoCamera, 
  MdSave, 
  MdRefresh, 
  MdLightbulb, 
  MdInfo, 
  MdOutlineVideoSettings,
  MdOutlineCameraAlt 
} from 'react-icons/md';
import { StoryboardPrompt } from '../../features/ai/aiSlice';

interface PromptEditorProps {
  prompt: StoryboardPrompt;
  sectionIndex: number;
  sectionText: string;
  onUpdate: (updatedPrompt: StoryboardPrompt) => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  sectionIndex,
  sectionText,
  onUpdate,
  onGenerateImage,
  isGeneratingImage,
}) => {
  // Local state
  const [editedPrompt, setEditedPrompt] = useState(prompt.prompt);
  const [cameraMovement, setCameraMovement] = useState(prompt.cameraMovement || 'static');
  const [shotType, setShotType] = useState(prompt.shotType || 'medium');
  const [hasChanges, setHasChanges] = useState(false);
  
  const bgColor = useColorModeValue('gray.700', 'gray.700');
  const borderColor = useColorModeValue('gray.600', 'gray.600');
  
  // Track changes
  useEffect(() => {
    const promptChanged = editedPrompt !== prompt.prompt;
    const movementChanged = cameraMovement !== (prompt.cameraMovement || 'static');
    const shotChanged = shotType !== (prompt.shotType || 'medium');
    
    setHasChanges(promptChanged || movementChanged || shotChanged);
  }, [editedPrompt, cameraMovement, shotType, prompt]);
  
  // Save changes
  const handleSave = () => {
    const updatedPrompt: StoryboardPrompt = {
      ...prompt,
      prompt: editedPrompt,
      cameraMovement,
      shotType,
    };
    
    onUpdate(updatedPrompt);
    setHasChanges(false);
  };
  
  // Reset changes
  const handleReset = () => {
    setEditedPrompt(prompt.prompt);
    setCameraMovement(prompt.cameraMovement || 'static');
    setShotType(prompt.shotType || 'medium');
    setHasChanges(false);
  };
  
  // Add suggested enhancement to prompt
  const enhancePrompt = (enhancement: string) => {
    setEditedPrompt(prev => {
      // Check if enhancement is already in prompt
      if (prev.toLowerCase().includes(enhancement.toLowerCase())) {
        return prev;
      }
      return `${prev}, ${enhancement}`;
    });
  };
  
  return (
    <Box 
      bg={bgColor} 
      p={5} 
      borderRadius="md" 
      borderWidth="1px" 
      borderColor={borderColor}
    >
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4}
      >
        <Heading size="sm">Scene {sectionIndex + 1} Prompt</Heading>
        <HStack>
          {hasChanges && (
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                colorScheme="brand" 
                leftIcon={<MdSave />} 
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          )}
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<MdPhotoCamera />}
            onClick={onGenerateImage}
            isLoading={isGeneratingImage}
            isDisabled={isGeneratingImage}
          >
            Generate Image
          </Button>
        </HStack>
      </Flex>
      
      {/* Screenplay text reference */}
      <Box mb={4} p={3} bg="gray.800" borderRadius="md">
        <Flex align="center" mb={2}>
          <Badge colorScheme="purple" mr={2}>Screenplay Text</Badge>
          <Text fontSize="sm" fontWeight="medium">Reference for prompt creation</Text>
        </Flex>
        <Text fontSize="sm">{sectionText}</Text>
      </Box>
      
      {/* Prompt editor */}
      <FormControl mb={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <FormLabel mb={0}>Midjourney Prompt</FormLabel>
          <Tooltip label="Effective prompts include style details, lighting, camera angle, and mood">
            <IconButton
              aria-label="Prompt tips"
              icon={<MdInfo />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </Flex>
        <Textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder="Enter detailed visual description for this scene..."
          size="md"
          rows={6}
          bg="gray.800"
        />
      </FormControl>
      
      {/* Camera settings */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontWeight="medium" fontSize="sm">
            <Icon as={MdOutlineVideoSettings} mr={1} />
            Camera Settings
          </Text>
          <Divider flex="1" ml={2} borderColor="gray.600" />
        </Flex>
        
        <HStack spacing={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">Shot Type</FormLabel>
            <Select 
              value={shotType} 
              onChange={(e) => setShotType(e.target.value)}
              size="sm"
              bg="gray.800"
            >
              <option value="extreme close-up">Extreme Close-Up</option>
              <option value="close-up">Close-Up</option>
              <option value="medium">Medium Shot</option>
              <option value="wide">Wide Shot</option>
              <option value="aerial">Aerial Shot</option>
              <option value="pov">POV Shot</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Camera Movement</FormLabel>
            <Select 
              value={cameraMovement} 
              onChange={(e) => setCameraMovement(e.target.value)}
              size="sm"
              bg="gray.800"
            >
              <option value="static">Static</option>
              <option value="pan">Pan</option>
              <option value="tilt">Tilt</option>
              <option value="zoom">Zoom</option>
              <option value="dolly">Dolly</option>
              <option value="track">Tracking</option>
            </Select>
          </FormControl>
        </HStack>
      </Box>
      
      {/* Prompt enhancers */}
      <Box>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontWeight="medium" fontSize="sm">
            <Icon as={MdLightbulb} mr={1} />
            Prompt Enhancers
          </Text>
          <Divider flex="1" ml={2} borderColor="gray.600" />
        </Flex>
        
        <Flex wrap="wrap" gap={2}>
          <Button size="sm" onClick={() => enhancePrompt('cinematic lighting')}>
            Cinematic Lighting
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('detailed')}>
            Detailed
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('shallow depth of field')}>
            Shallow DoF
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('photorealistic')}>
            Photorealistic
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('film grain')}>
            Film Grain
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('volumetric lighting')}>
            Volumetric Light
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('dramatic shadows')}>
            Dramatic Shadows
          </Button>
          <Button size="sm" onClick={() => enhancePrompt('8k ultra hd')}>
            8K Ultra HD
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default PromptEditor;
