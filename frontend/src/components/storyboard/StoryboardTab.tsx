import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useToast,
  HStack,
  VStack,
  useDisclosure,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { MdSave, MdRefresh, MdAutorenew, MdPhotoLibrary, MdMovie } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { 
  Screenplay, 
  Storyboard, 
  GeneratedImage,
  StoryboardPrompt,
  generateStoryboard, 
  generateImage 
} from '../../features/ai/aiSlice';
import { updateProject } from '../../features/projects/projectSlice';

// Import subcomponents
import StoryboardViewer from './StoryboardViewer';
import ImageEditor from './ImageEditor';
import PromptEditor from './PromptEditor';

interface StoryboardTabProps {
  projectId: string;
  initialScreenplay: Screenplay | null;
  initialStoryboard?: Storyboard | null;
  initialImages?: GeneratedImage[];
  onStoryboardChange?: (storyboard: Storyboard) => void;
  onImagesChange?: (images: GeneratedImage[]) => void;
}

const StoryboardTab: React.FC<StoryboardTabProps> = ({
  projectId,
  initialScreenplay,
  initialStoryboard = null,
  initialImages = [],
  onStoryboardChange,
  onImagesChange,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Get state from Redux
  const { 
    storyboard: reduxStoryboard, 
    generatedImages: reduxGeneratedImages,
    isGeneratingStoryboard,
    isGeneratingImage,
    error: aiError
  } = useAppSelector((state) => state.ai);
  
  const { currentProject, isLoading: isProjectLoading } = useAppSelector((state) => state.projects);
  
  // Local state
  const [storyboard, setStoryboard] = useState<Storyboard | null>(initialStoryboard || reduxStoryboard);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(initialImages || reduxGeneratedImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(-1);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Modal states
  const { 
    isOpen: isImageEditorOpen, 
    onOpen: openImageEditor, 
    onClose: closeImageEditor 
  } = useDisclosure();
  
  // Update local state when redux state changes
  useEffect(() => {
    if (reduxStoryboard) {
      setStoryboard(reduxStoryboard);
      if (onStoryboardChange) {
        onStoryboardChange(reduxStoryboard);
      }
    }
  }, [reduxStoryboard, onStoryboardChange]);
  
  useEffect(() => {
    if (reduxGeneratedImages.length > 0) {
      setGeneratedImages(reduxGeneratedImages);
      if (onImagesChange) {
        onImagesChange(reduxGeneratedImages);
      }
    }
  }, [reduxGeneratedImages, onImagesChange]);
  
  // Track changes
  useEffect(() => {
    let changed = false;
    
    // Check if storyboard has changed
    if (initialStoryboard === null && storyboard !== null) {
      changed = true;
    } else if (initialStoryboard !== null && storyboard !== null) {
      // Compare prompts
      if (initialStoryboard.prompts.length !== storyboard.prompts.length) {
        changed = true;
      } else {
        for (let i = 0; i < initialStoryboard.prompts.length; i++) {
          if (
            initialStoryboard.prompts[i].prompt !== storyboard.prompts[i].prompt ||
            initialStoryboard.prompts[i].cameraMovement !== storyboard.prompts[i].cameraMovement ||
            initialStoryboard.prompts[i].shotType !== storyboard.prompts[i].shotType
          ) {
            changed = true;
            break;
          }
        }
      }
    }
    
    // Check if images have changed
    if (initialImages.length !== generatedImages.length) {
      changed = true;
    }
    
    setHasChanges(changed);
  }, [storyboard, generatedImages, initialStoryboard, initialImages]);
  
  // Generate storyboard prompts from screenplay
  const handleGenerateStoryboard = async () => {
    if (!initialScreenplay) {
      toast({
        title: 'Missing screenplay',
        description: 'You need to create a screenplay before generating a storyboard.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // In a real app, we would dispatch the action to generate the storyboard
      await dispatch(generateStoryboard({
        screenplayId: projectId,
        styleDescription: currentProject?.styleData?.srefCode || '',
      }));
      
      toast({
        title: 'Storyboard created',
        description: 'Your storyboard prompts have been generated. You can now edit them if needed or generate images directly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to generate storyboard:', error);
    }
  };
  
  // Generate images from prompts
  const handleGenerateImages = async () => {
    if (!storyboard || storyboard.prompts.length === 0) {
      toast({
        title: 'Missing prompts',
        description: 'You need to generate storyboard prompts first.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // For the demo, simulate generating images for all prompts in sequence
    for (const prompt of storyboard.prompts) {
      try {
        // In a real app, we would dispatch the action to generate each image
        await dispatch(generateImage({
          prompt: prompt.prompt,
          styleReference: currentProject?.styleData?.srefCode,
          aspectRatio: currentProject?.aspectRatio || '16:9',
        }));
      } catch (error) {
        console.error('Failed to generate image:', error);
      }
    }
  };
  
  // Generate image for a specific prompt
  const handleGenerateSingleImage = async (promptIndex: number) => {
    if (!storyboard || !storyboard.prompts[promptIndex]) {
      return;
    }
    
    const prompt = storyboard.prompts[promptIndex];
    
    try {
      await dispatch(generateImage({
        prompt: prompt.prompt,
        styleReference: currentProject?.styleData?.srefCode,
        aspectRatio: currentProject?.aspectRatio || '16:9',
      }));
      
      toast({
        title: 'Image generated',
        description: 'Your image has been created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };
  
  // Open prompt editor for a specific prompt
  const handleEditPrompt = (index: number) => {
    setSelectedPromptIndex(index);
    setIsEditingPrompt(true);
  };
  
  // Update a prompt in the storyboard
  const handleUpdatePrompt = (index: number, updatedPrompt: StoryboardPrompt) => {
    if (!storyboard) return;
    
    const updatedPrompts = [...storyboard.prompts];
    updatedPrompts[index] = updatedPrompt;
    
    setStoryboard({
      ...storyboard,
      prompts: updatedPrompts,
    });
    
    setIsEditingPrompt(false);
    
    toast({
      title: 'Prompt updated',
      description: 'Your prompt has been updated. Generate a new image to see the changes.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Open image editor for a specific image
  const handleEditImage = (index: number) => {
    setSelectedImageIndex(index);
    openImageEditor();
  };
  
  // Save changes to the project
  const handleSaveChanges = async () => {
    try {
      // In a real app, we would dispatch an action to update the project
      await dispatch(updateProject({
        id: projectId,
        storyboard,
        storyboardImages: generatedImages,
        status: 'in-progress',
      }));
      
      toast({
        title: 'Storyboard saved',
        description: 'Your storyboard and images have been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast({
        title: 'Error saving storyboard',
        description: 'An error occurred while saving your storyboard.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Reset changes
  const handleResetChanges = () => {
    setStoryboard(initialStoryboard || null);
    setGeneratedImages(initialImages || []);
    setHasChanges(false);
  };
  
  // Display an error message if we're missing a screenplay
  if (!initialScreenplay) {
    return (
      <Box>
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            You need to create a screenplay in the Storytelling tab before generating a storyboard.
          </AlertDescription>
        </Alert>
        <Button
          colorScheme="brand"
          onClick={() => window.history.back()}
        >
          Go Back to Storytelling
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header with actions */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Storyboard</Heading>
        <HStack>
          {hasChanges && (
            <Button
              variant="outline"
              leftIcon={<MdRefresh />}
              onClick={handleResetChanges}
              isDisabled={isGeneratingStoryboard || isGeneratingImage || isProjectLoading}
            >
              Reset Changes
            </Button>
          )}
          <Button
            colorScheme="brand"
            leftIcon={<MdAutorenew />}
            onClick={handleGenerateStoryboard}
            isLoading={isGeneratingStoryboard}
            isDisabled={!initialScreenplay || isGeneratingImage}
            loadingText="Generating"
          >
            Generate Prompts
          </Button>
          <Button
            colorScheme="brand"
            leftIcon={<MdPhotoLibrary />}
            onClick={handleGenerateImages}
            isLoading={isGeneratingImage}
            isDisabled={!storyboard || isGeneratingStoryboard || storyboard.prompts.length === 0}
            loadingText="Generating"
          >
            Generate All Images
          </Button>
          {hasChanges && (
            <Button
              colorScheme="brand"
              leftIcon={<MdSave />}
              onClick={handleSaveChanges}
              isLoading={isProjectLoading}
              isDisabled={isGeneratingStoryboard || isGeneratingImage}
            >
              Save Changes
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Error alert */}
      {aiError && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertDescription>{aiError}</AlertDescription>
        </Alert>
      )}
      
      {/* Main content */}
      {isGeneratingStoryboard ? (
        <Center h="50vh">
          <VStack spacing={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
            <Text>Generating storyboard prompts...</Text>
          </VStack>
        </Center>
      ) : (
        <Tabs colorScheme="brand" variant="enclosed">
          <TabList>
            <Tab>Storyboard View</Tab>
            <Tab>Prompt Editor</Tab>
          </TabList>
          
          <TabPanels>
            {/* Storyboard Viewer Tab */}
            <TabPanel p={0} pt={4}>
              {storyboard && storyboard.prompts.length > 0 ? (
                <StoryboardViewer
                  screenplay={initialScreenplay}
                  storyboard={storyboard}
                  generatedImages={generatedImages}
                  onGenerateImage={handleGenerateSingleImage}
                  onEditPrompt={handleEditPrompt}
                  onEditImage={handleEditImage}
                  isGeneratingImage={isGeneratingImage}
                />
              ) : (
                <Center h="50vh">
                  <VStack spacing={4}>
                    <Text>No storyboard prompts available.</Text>
                    <Button
                      colorScheme="brand"
                      leftIcon={<MdAutorenew />}
                      onClick={handleGenerateStoryboard}
                    >
                      Generate Storyboard
                    </Button>
                  </VStack>
                </Center>
              )}
            </TabPanel>
            
            {/* Prompt Editor Tab */}
            <TabPanel p={0} pt={4}>
              {storyboard && storyboard.prompts.length > 0 ? (
                <VStack spacing={6} align="stretch">
                  {storyboard.prompts.map((prompt, index) => (
                    <PromptEditor
                      key={index}
                      prompt={prompt}
                      sectionIndex={index}
                      sectionText={initialScreenplay.sections[index]?.text || ''}
                      onUpdate={(updatedPrompt) => handleUpdatePrompt(index, updatedPrompt)}
                      onGenerateImage={() => handleGenerateSingleImage(index)}
                      isGeneratingImage={isGeneratingImage}
                    />
                  ))}
                </VStack>
              ) : (
                <Center h="50vh">
                  <VStack spacing={4}>
                    <Text>No storyboard prompts available for editing.</Text>
                    <Button
                      colorScheme="brand"
                      leftIcon={<MdAutorenew />}
                      onClick={handleGenerateStoryboard}
                    >
                      Generate Storyboard
                    </Button>
                  </VStack>
                </Center>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      
      {/* Image Editor Modal */}
      {selectedImageIndex !== -1 && generatedImages[selectedImageIndex] && (
        <ImageEditor
          isOpen={isImageEditorOpen}
          onClose={closeImageEditor}
          image={generatedImages[selectedImageIndex]}
          onSave={(updatedImage) => {
            const updatedImages = [...generatedImages];
            updatedImages[selectedImageIndex] = updatedImage;
            setGeneratedImages(updatedImages);
            if (onImagesChange) {
              onImagesChange(updatedImages);
            }
          }}
        />
      )}
      
      {/* Bottom save button */}
      {hasChanges && (
        <Flex justify="flex-end" mt={8}>
          <Button
            colorScheme="brand"
            leftIcon={<MdSave />}
            onClick={handleSaveChanges}
            isLoading={isProjectLoading}
            isDisabled={isGeneratingStoryboard || isGeneratingImage}
          >
            Save Changes
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default StoryboardTab;
