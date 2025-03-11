import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  VStack,
  Divider,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaMusic, FaMicrophone, FaMix } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import MusicGenerator from './MusicGenerator';
import VoiceOverEditor from './VoiceOverEditor';
import AudioMixer from './AudioMixer';

// Types for the AudioTab props
interface AudioTabProps {
  projectId: string;
  videoUrl?: string; // Optional video URL for syncing
  onAudioGenerated?: (audioData: AudioData) => void;
}

// Type for generated audio data
export interface AudioData {
  musicTrack?: {
    url: string;
    name: string;
    duration: number;
  };
  voiceoverTracks?: Array<{
    id: string;
    url: string;
    text: string;
    startTime: number;
    duration: number;
    voice: string;
  }>;
  soundEffects?: Array<{
    id: string;
    url: string;
    name: string;
    startTime: number;
    duration: number;
  }>;
}

// Main AudioTab component
const AudioTab: React.FC<AudioTabProps> = ({ projectId, videoUrl, onAudioGenerated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [audioData, setAudioData] = useState<AudioData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const toast = useToast();
  const dispatch = useAppDispatch();
  
  // Get project data from Redux store
  const { project, isLoading: projectLoading } = useAppSelector((state) => state.projects);
  
  useEffect(() => {
    // Load project data if not already loaded
    if (projectId && !project) {
      // Dispatch action to load project data
      // dispatch(fetchProject(projectId));
      
      // For now, we'll use mock data
      console.log("Would load project data for ID:", projectId);
    }
  }, [projectId, project, dispatch]);
  
  // Handlers for audio components
  const handleMusicGenerated = (music: AudioData['musicTrack']) => {
    setAudioData(prev => ({
      ...prev,
      musicTrack: music
    }));
    
    toast({
      title: 'Music Generated',
      description: 'Background music has been generated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Move to the mixer tab
    setActiveTab(2);
  };
  
  const handleVoiceOverGenerated = (voiceovers: AudioData['voiceoverTracks']) => {
    setAudioData(prev => ({
      ...prev,
      voiceoverTracks: voiceovers
    }));
    
    toast({
      title: 'Voice-over Generated',
      description: 'Voice-over has been generated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Move to the mixer tab
    setActiveTab(2);
  };
  
  const handleMixCompleted = (mixedAudio: AudioData) => {
    // This would typically finalize the audio and pass it back to the parent
    if (onAudioGenerated) {
      onAudioGenerated(mixedAudio);
    }
    
    toast({
      title: 'Audio Mix Completed',
      description: 'Your audio tracks have been mixed successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box bg="gray.800" p={6} borderRadius="md">
      <Stack spacing={6}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">
            <Flex alignItems="center">
              <FaMusic color="#3182CE" />
              <Text ml={2}>Audio Production</Text>
            </Flex>
          </Heading>
        </Flex>
        
        <Text color="gray.400">
          Add background music, voice-over narration, and sound effects to enhance your video.
        </Text>
        
        <Divider borderColor="gray.600" />
        
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="brand" variant="enclosed">
          <TabList>
            <Tab>
              <Flex align="center">
                <FaMusic />
                <Text ml={2}>Background Music</Text>
              </Flex>
            </Tab>
            <Tab>
              <Flex align="center">
                <FaMicrophone />
                <Text ml={2}>Voice-over</Text>
              </Flex>
            </Tab>
            <Tab>
              <Flex align="center">
                <FaMix />
                <Text ml={2}>Audio Mixer</Text>
              </Flex>
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Background Music Tab */}
            <TabPanel p={4}>
              <MusicGenerator 
                onMusicGenerated={handleMusicGenerated}
                currentMusic={audioData.musicTrack}
              />
            </TabPanel>
            
            {/* Voice-over Tab */}
            <TabPanel p={4}>
              <VoiceOverEditor 
                onVoiceOverGenerated={handleVoiceOverGenerated}
                currentVoiceOvers={audioData.voiceoverTracks}
                projectId={projectId}
                screenplay={project?.screenplay}
              />
            </TabPanel>
            
            {/* Audio Mixer Tab */}
            <TabPanel p={4}>
              <AudioMixer 
                audioData={audioData}
                onMixCompleted={handleMixCompleted}
                videoUrl={videoUrl}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
};

export default AudioTab;