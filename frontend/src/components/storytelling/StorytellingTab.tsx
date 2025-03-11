import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { FaArrowRight } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { 
  generateScreenplay, 
  refineScreenplaySection,
  Screenplay,
  clearScreenplay,
  setMockScreenplay,
} from '../../features/ai/aiSlice';
import { updateProject } from '../../features/projects/projectSlice';

// Storytelling components
import ConceptInput from './ConceptInput';
import GenerationOptions, { GenerationOptionsValues } from './GenerationOptions';
import ScreenplayEditor from './ScreenplayEditor';

interface StorytellingTabProps {
  projectId: string;
  initialScreenplay?: Screenplay | null;
  onScreenplayChange?: (screenplay: Screenplay) => void;
}

const StorytellingTab: React.FC<StorytellingTabProps> = ({
  projectId,
  initialScreenplay = null,
  onScreenplayChange,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Redux state
  const { 
    screenplay: reduxScreenplay, 
    isGeneratingScreenplay, 
    error 
  } = useAppSelector((state) => state.ai);
  
  const { currentProject } = useAppSelector((state) => state.projects);
  
  // Local state
  const [screenplay, setScreenplay] = useState<Screenplay | null>(initialScreenplay || reduxScreenplay);
  const [conceptInputValue, setConceptInputValue] = useState(initialScreenplay?.concept || '');
  const [activeStep, setActiveStep] = useState(screenplay ? 1 : 0); // 0 = concept input, 1 = screenplay editor
  
  // Generation options
  const [options, setOptions] = useState<GenerationOptionsValues>({
    tone: 'professional',
    genre: 'informational',
    targetAudience: 'general',
    formalityLevel: 3,
    instructionalLevel: false,
  });
  
  // Update local screenplay when redux state changes
  useEffect(() => {
    if (reduxScreenplay) {
      setScreenplay(reduxScreenplay);
      if (onScreenplayChange) {
        onScreenplayChange(reduxScreenplay);
      }
    }
  }, [reduxScreenplay, onScreenplayChange]);
  
  // Set concept from screenplay if available
  useEffect(() => {
    if (screenplay?.concept && conceptInputValue === '') {
      setConceptInputValue(screenplay.concept);
    }
  }, [screenplay]);

  // Show error toast if AI generation fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);
  
  // Handle concept submission to generate screenplay
  const handleConceptSubmit = async (concept: string) => {
    try {
      // For development/testing - use mock data or dispatch real action
      const USE_MOCK_DATA = false;
      
      if (USE_MOCK_DATA) {
        // Mock data for testing without API calls
        const mockScreenplay: Screenplay = {
          concept,
          sections: [
            { id: '1', text: 'Introduction section that sets up the concept.', order: 0 },
            { id: '2', text: 'Development of the main idea with more details.', order: 1 },
            { id: '3', text: 'Main point of the video with the core message.', order: 2 },
            { id: '4', text: 'Supporting information and additional context.', order: 3 },
            { id: '5', text: 'Conclusion with call to action or summary.', order: 4 },
          ],
        };
        
        dispatch(setMockScreenplay(mockScreenplay));
      } else {
        // Real API call
        const styleDescription = currentProject?.styleData?.keywords?.join(', ') || '';
        
        await dispatch(generateScreenplay({
          concept,
          styleDescription,
          targetDuration: currentProject?.targetDuration || 60,
          tone: options.tone,
          genre: options.genre,
        })).unwrap();
      }
      
      // Move to screenplay editor
      setActiveStep(1);
      
      toast({
        title: 'Screenplay generated',
        description: 'Your screenplay has been generated successfully. You can now edit it.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the useEffect above
      console.error('Failed to generate screenplay:', error);
    }
  };
  
  // Handle saving screenplay to project
  const handleSaveScreenplay = async (updatedScreenplay: Screenplay) => {
    try {
      // Update local state first
      setScreenplay(updatedScreenplay);
      
      // Save to project
      await dispatch(updateProject({
        id: projectId,
        screenplay: updatedScreenplay,
        status: 'in-progress',
      }));
      
      if (onScreenplayChange) {
        onScreenplayChange(updatedScreenplay);
      }
    } catch (error) {
      console.error('Failed to save screenplay:', error);
      toast({
        title: 'Error',
        description: 'Failed to save screenplay. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle regenerating the entire screenplay
  const handleRegenerateAll = async () => {
    if (!screenplay?.concept) return;
    
    // Use the current concept to regenerate
    await handleConceptSubmit(screenplay.concept);
  };
  
  // Handle refining a section of the screenplay
  const handleRefineSection = async (sectionId: string, instructions: string) => {
    if (!screenplay) return;
    
    try {
      await dispatch(refineScreenplaySection({
        sectionId,
        screenplayId: projectId,
        instructions,
      })).unwrap();
      
      toast({
        title: 'Section refined',
        description: 'The section has been refined based on your instructions.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to refine section:', error);
    }
  };
  
  // Reset screenplay and go back to concept input
  const handleReset = () => {
    dispatch(clearScreenplay());
    setScreenplay(null);
    setActiveStep(0);
  };
  
  // Loading state
  if (isGeneratingScreenplay && !screenplay) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.500"
            size="xl"
          />
          <Text>Generating screenplay...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <Tabs index={activeStep} isLazy>
        <TabList>
          <Tab>1. Concept</Tab>
          <Tab isDisabled={!screenplay}>2. Screenplay</Tab>
        </TabList>
        
        <TabPanels>
          {/* Concept Input Step */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <ConceptInput
                initialConcept={conceptInputValue}
                onConceptSubmit={handleConceptSubmit}
                isLoading={isGeneratingScreenplay}
                styleKeywords={currentProject?.styleData?.keywords}
              />
              
              <Divider borderColor="gray.700" />
              
              <GenerationOptions
                options={options}
                onChange={setOptions}
                isDisabled={isGeneratingScreenplay}
              />
              
              {/* Skip to editor if screenplay already exists */}
              {screenplay && (
                <Box textAlign="center" mt={4}>
                  <Button
                    rightIcon={<FaArrowRight />}
                    onClick={() => setActiveStep(1)}
                    variant="ghost"
                  >
                    Skip to Editor
                  </Button>
                </Box>
              )}
            </VStack>
          </TabPanel>
          
          {/* Screenplay Editor Step */}
          <TabPanel>
            {screenplay ? (
              <VStack spacing={6} align="stretch">
                <Box textAlign="left" mb={2}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveStep(0)}
                  >
                    « Back to Concept
                  </Button>
                </Box>
                
                <ScreenplayEditor
                  screenplay={screenplay}
                  projectId={projectId}
                  onSaveScreenplay={handleSaveScreenplay}
                  onRegenerateAll={handleRegenerateAll}
                  onRefineSection={handleRefineSection}
                  isLoading={isGeneratingScreenplay}
                />
              </VStack>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertTitle>No screenplay yet</AlertTitle>
                <AlertDescription>
                  Go back to the Concept tab to generate a screenplay first.
                </AlertDescription>
              </Alert>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default StorytellingTab;
