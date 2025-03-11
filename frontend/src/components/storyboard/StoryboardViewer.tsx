import React from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  IconButton,
  VStack,
  HStack,
  Divider,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  MdEdit, 
  MdRefresh, 
  MdPhotoCamera, 
  MdVideocam, 
  MdMovie, 
  MdPhotoFilter 
} from 'react-icons/md';
import { Screenplay, Storyboard, GeneratedImage, StoryboardPrompt } from '../../features/ai/aiSlice';

interface StoryboardViewerProps {
  screenplay: Screenplay;
  storyboard: Storyboard;
  generatedImages: GeneratedImage[];
  onGenerateImage: (promptIndex: number) => void;
  onEditPrompt: (promptIndex: number) => void;
  onEditImage: (imageIndex: number) => void;
  isGeneratingImage: boolean;
}

const StoryboardViewer: React.FC<StoryboardViewerProps> = ({
  screenplay,
  storyboard,
  generatedImages,
  onGenerateImage,
  onEditPrompt,
  onEditImage,
  isGeneratingImage,
}) => {
  const cardBg = useColorModeValue('gray.700', 'gray.700');
  const borderColor = useColorModeValue('gray.600', 'gray.600');

  // Helper function to find the corresponding image for a prompt
  const findImageForPrompt = (sectionId: string): GeneratedImage | undefined => {
    return generatedImages.find(image => {
      // In a real app, we'd have a clear relationship between prompts and images
      // For now, use array index as a simple way to match them
      const promptIndex = storyboard.prompts.findIndex(p => p.sectionId === sectionId);
      return promptIndex === generatedImages.indexOf(image);
    });
  };

  // Get camera movement and shot type badges
  const getCameraBadge = (prompt: StoryboardPrompt) => {
    if (!prompt.cameraMovement) return null;

    let color;
    switch (prompt.cameraMovement.toLowerCase()) {
      case 'static':
        color = 'gray';
        break;
      case 'pan':
        color = 'blue';
        break;
      case 'tilt':
        color = 'cyan';
        break;
      case 'zoom':
        color = 'purple';
        break;
      case 'dolly':
        color = 'pink';
        break;
      case 'track':
        color = 'orange';
        break;
      default:
        color = 'gray';
    }

    return (
      <Badge colorScheme={color} mr={2}>
        {prompt.cameraMovement}
      </Badge>
    );
  };

  const getShotTypeBadge = (prompt: StoryboardPrompt) => {
    if (!prompt.shotType) return null;

    let color;
    switch (prompt.shotType.toLowerCase()) {
      case 'close-up':
      case 'closeup':
        color = 'red';
        break;
      case 'medium':
        color = 'orange';
        break;
      case 'wide':
        color = 'green';
        break;
      case 'extreme close-up':
        color = 'purple';
        break;
      case 'aerial':
        color = 'blue';
        break;
      default:
        color = 'gray';
    }

    return (
      <Badge colorScheme={color}>
        {prompt.shotType}
      </Badge>
    );
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Visual Storyboard</Heading>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {storyboard.prompts.map((prompt, index) => {
          // Match screenplay section with prompt
          const section = screenplay.sections.find(s => s.id === prompt.sectionId) || 
                         screenplay.sections[index];
          
          // Find corresponding image
          const image = findImageForPrompt(prompt.sectionId) || 
                       (generatedImages.length > index ? generatedImages[index] : undefined);
          
          return (
            <Box 
              key={index} 
              p={4} 
              bg={cardBg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              transition="transform 0.2s"
              _hover={{ transform: 'translateY(-4px)' }}
            >
              {/* Scene number and badges */}
              <Flex justify="space-between" align="center" mb={2}>
                <Badge fontSize="sm" colorScheme="brand" px={2} py={1}>
                  Scene {index + 1}
                </Badge>
                <HStack>
                  {getCameraBadge(prompt)}
                  {getShotTypeBadge(prompt)}
                </HStack>
              </Flex>
              
              {/* Image area */}
              <Box 
                position="relative" 
                bg="gray.800" 
                borderRadius="md" 
                height="200px"
                overflow="hidden"
                mb={3}
              >
                {image ? (
                  <>
                    <Image
                      src={image.url}
                      alt={`Scene ${index + 1}`}
                      objectFit="cover"
                      width="100%"
                      height="100%"
                    />
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      p={2}
                      zIndex={1}
                    >
                      <IconButton
                        aria-label="Edit image"
                        icon={<MdPhotoFilter />}
                        size="sm"
                        colorScheme="brand"
                        onClick={() => onEditImage(generatedImages.indexOf(image))}
                      />
                    </Box>
                  </>
                ) : isGeneratingImage ? (
                  <Flex 
                    justify="center" 
                    align="center" 
                    height="100%"
                  >
                    <Skeleton height="100%" width="100%" />
                  </Flex>
                ) : (
                  <Flex 
                    justify="center" 
                    align="center" 
                    height="100%"
                    flexDirection="column"
                    gap={2}
                  >
                    <Text color="gray.400" fontSize="sm">No image generated yet</Text>
                    <Button
                      leftIcon={<MdPhotoCamera />}
                      size="sm"
                      colorScheme="brand"
                      onClick={() => onGenerateImage(index)}
                      isLoading={isGeneratingImage}
                    >
                      Generate
                    </Button>
                  </Flex>
                )}
              </Box>
              
              {/* Screenplay text */}
              <Box mb={3}>
                <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.400">
                  Screenplay:
                </Text>
                <Text fontSize="sm" noOfLines={4} mb={2}>
                  {section?.text || 'No text available for this scene.'}
                </Text>
              </Box>
              
              <Divider my={2} borderColor="gray.600" />
              
              {/* Prompt preview */}
              <Box mb={3}>
                <Text fontSize="sm" fontWeight="bold" mb={1} color="gray.400">
                  Prompt:
                </Text>
                <Text fontSize="xs" noOfLines={3} fontFamily="mono" color="gray.300">
                  {prompt.prompt}
                </Text>
              </Box>
              
              {/* Actions */}
              <Flex justify="space-between" mt={2}>
                <Button
                  leftIcon={<MdEdit />}
                  size="sm"
                  variant="outline"
                  onClick={() => onEditPrompt(index)}
                >
                  Edit Prompt
                </Button>
                
                <Button
                  leftIcon={<MdRefresh />}
                  size="sm"
                  colorScheme="brand"
                  onClick={() => onGenerateImage(index)}
                  isLoading={isGeneratingImage}
                  isDisabled={isGeneratingImage}
                >
                  Regenerate
                </Button>
              </Flex>
            </Box>
          );
        })}
      </Grid>
      
      {/* Navigation to video generation */}
      {generatedImages.length > 0 && generatedImages.length >= screenplay.sections.length && (
        <Flex justify="center" mt={12} mb={4}>
          <Button
            size="lg"
            colorScheme="green"
            leftIcon={<MdMovie />}
            onClick={() => {
              // Navigate to video tab or activate video generation
              // This would be connected to navigation in a real app
              console.log('Ready to generate video');
            }}
          >
            Ready for Video Generation
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default StoryboardViewer;
