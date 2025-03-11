import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Flex,
  useToast,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { FaVideo, FaCog, FaPlay } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import CameraControls from './CameraControls';
import TimelineEditor from './TimelineEditor';
import VideoPreview from './VideoPreview';

// Types for the VideoTab props
interface VideoTabProps {
  projectId: string;
  onVideoGenerated?: (videoUrl: string) => void;
}

// Main VideoTab component
const VideoTab: React.FC<VideoTabProps> = ({ projectId, onVideoGenerated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  
  const toast = useToast();
  const dispatch = useAppDispatch();
  
  // Get project data from Redux store
  const { project, isLoading: projectLoading } = useAppSelector((state) => state.projects);
  const { storyboard } = useAppSelector((state) => state.ai);
  
  useEffect(() => {
    // Load project data if not already loaded
    if (projectId && !project) {
      // Dispatch action to load project data
      // dispatch(fetchProject(projectId));
      
      // For now, we'll use mock data
      console.log("Would load project data for ID:", projectId);
    }
  }, [projectId, project, dispatch]);
  
  // Handle video generation
  const handleGenerateVideo = async () => {
    if (!storyboard || storyboard.length === 0) {
      toast({
        title: 'Cannot generate video',
        description: 'Please create a storyboard first.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Simulate video generation
      setTimeout(() => {
        // Mock video URL
        const mockVideoUrl = 'https://example.com/mock-video.mp4';
        setGeneratedVideoUrl(mockVideoUrl);
        
        if (onVideoGenerated) {
          onVideoGenerated(mockVideoUrl);
        }
        
        toast({
          title: 'Video Generated',
          description: 'Your video has been successfully generated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        setIsGenerating(false);
        
        // Move to the preview tab
        setActiveTab(2);
      }, 3000);
      
      // In a real app, we would dispatch an async action to generate the video:
      // await dispatch(generateVideo({ projectId, storyboardImages: storyboard })).unwrap();
    } catch (error) {
      console.error('Failed to generate video:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate video. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsGenerating(false);
    }
  };
  
  return (
    <Box bg="gray.800" p={6} borderRadius="md">
      <Stack spacing={6}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">
            <Flex alignItems="center">
              <FaVideo color="#3182CE" />
              <Text ml={2}>Video Generation</Text>
            </Flex>
          </Heading>
          
          <Button
            leftIcon={<FaPlay />}
            colorScheme="brand"
            onClick={handleGenerateVideo}
            isLoading={isGenerating}
            loadingText="Generating Video"
            isDisabled={!storyboard || storyboard.length === 0}
          >
            Generate Video
          </Button>
        </Flex>
        
        <Text color="gray.400">
          Transform your storyboard into a fluid video with camera movements, transitions, and timing controls.
        </Text>
        
        <Divider borderColor="gray.600" />
        
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand" variant="enclosed">
          <TabList>
            <Tab>Camera Controls</Tab>
            <Tab>Timeline</Tab>
            <Tab isDisabled={!generatedVideoUrl}>Preview</Tab>
          </TabList>
          
          <TabPanels>
            {/* Camera Controls Tab */}
            <TabPanel p={4}>
              <CameraControls 
                storyboard={storyboard || []} 
                onChange={(updatedFrames) => {
                  // Handle updated camera settings
                  console.log("Camera settings updated:", updatedFrames);
                }}
              />
            </TabPanel>
            
            {/* Timeline Editor Tab */}
            <TabPanel p={4}>
              <TimelineEditor 
                storyboard={storyboard || []} 
                onChange={(updatedTimeline) => {
                  // Handle updated timeline
                  console.log("Timeline updated:", updatedTimeline);
                }}
              />
            </TabPanel>
            
            {/* Video Preview Tab */}
            <TabPanel p={4}>
              {generatedVideoUrl ? (
                <VideoPreview 
                  videoUrl={generatedVideoUrl} 
                  onExport={() => {
                    // Handle export
                    console.log("Exporting video");
                  }}
                />
              ) : (
                <VStack spacing={4} py={10}>
                  <Text color="gray.500">No video has been generated yet.</Text>
                  <Button
                    leftIcon={<FaPlay />}
                    onClick={handleGenerateVideo}
                    isLoading={isGenerating}
                  >
                    Generate Video
                  </Button>
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
};

export default VideoTab;