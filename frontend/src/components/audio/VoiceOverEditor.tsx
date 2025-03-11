import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Select,
  SimpleGrid as ChakraSimpleGrid,
  Badge,
  IconButton,
  useToast,
  VStack,
  Divider,
  HStack,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { 
  FaMicrophone, 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaVolumeUp,
  FaUserAlt,
  FaSyncAlt,
  FaChevronDown,
  FaRobot,
  FaRegLightbulb,
} from 'react-icons/fa';
import { AudioData } from './AudioTab';

// Props for the VoiceOverEditor component
interface VoiceOverEditorProps {
  onVoiceOverGenerated: (voiceovers: AudioData['voiceoverTracks']) => void;
  currentVoiceOvers?: AudioData['voiceoverTracks'];
  projectId: string;
  screenplay?: any; // Use the actual screenplay type from your project
}

// Voice type
interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  accent?: string;
  preview?: string;
  isPremium?: boolean;
}

// Voice-over segment
interface VoiceOverSegment {
  id: string;
  text: string;
  voice: string;
  url?: string;
  startTime: number;
  duration: number;
  isGenerated: boolean;
}

// Sample voice options
const VOICE_OPTIONS: Voice[] = [
  { id: 'en-US-1', name: 'Emily', gender: 'female', language: 'English (US)', accent: 'Neutral', preview: 'https://example.com/voices/emily.mp3' },
  { id: 'en-US-2', name: 'Michael', gender: 'male', language: 'English (US)', accent: 'Neutral', preview: 'https://example.com/voices/michael.mp3' },
  { id: 'en-GB-1', name: 'Sophie', gender: 'female', language: 'English (UK)', accent: 'British', preview: 'https://example.com/voices/sophie.mp3' },
  { id: 'en-GB-2', name: 'James', gender: 'male', language: 'English (UK)', accent: 'British', preview: 'https://example.com/voices/james.mp3' },
  { id: 'en-AU-1', name: 'Olivia', gender: 'female', language: 'English (AU)', accent: 'Australian', preview: 'https://example.com/voices/olivia.mp3', isPremium: true },
  { id: 'en-AU-2', name: 'Liam', gender: 'male', language: 'English (AU)', accent: 'Australian', preview: 'https://example.com/voices/liam.mp3', isPremium: true },
  { id: 'en-neutral-1', name: 'Alex', gender: 'neutral', language: 'English', accent: 'Neutral', preview: 'https://example.com/voices/alex.mp3' },
];

// Main VoiceOverEditor component
const VoiceOverEditor: React.FC<VoiceOverEditorProps> = ({ 
  onVoiceOverGenerated, 
  currentVoiceOvers, 
  projectId, 
  screenplay 
}) => {
  const [voiceSegments, setVoiceSegments] = useState<VoiceOverSegment[]>(
    currentVoiceOvers?.map(v => ({ 
      id: v.id, 
      text: v.text, 
      voice: v.voice, 
      url: v.url, 
      startTime: v.startTime, 
      duration: v.duration,
      isGenerated: true,
    })) || []
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].id);
  const [scriptText, setScriptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<VoiceOverSegment | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);
  const [useAIScript, setUseAIScript] = useState(true);
  const [aiScript, setAiScript] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const toast = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      }
    };
  }, []);
  
  // Generate AI script based on screenplay when component mounts
  useEffect(() => {
    if (screenplay && useAIScript && !aiScript) {
      generateAIScript();
    }
  }, [screenplay, useAIScript]);
  
  // Reset script when switching between AI and manual
  useEffect(() => {
    if (!useAIScript) {
      setScriptText('');
    } else if (aiScript) {
      setScriptText(aiScript);
    }
  }, [useAIScript, aiScript]);
  
  // Handle audio playback
  const handlePlayPause = (audioUrl?: string) => {
    if (!audioRef.current) return;
    
    // If new audio URL is provided, change the source
    if (audioUrl && audioUrl !== currentAudioUrl) {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      setCurrentAudioUrl(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    // Otherwise toggle play/pause of current audio
    if (isPlaying) {
      audioRef.current.pause();
    } else if (currentAudioUrl) {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Stop playback
  const handleStop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };
  
  // Generate AI script based on screenplay
  const generateAIScript = () => {
    if (!screenplay) {
      toast({
        title: 'Screenplay Not Available',
        description: 'No screenplay data is available to generate a voice-over script.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoadingAI(true);
    
    // Simulate API call to generate script
    setTimeout(() => {
      // Mock generated script from screenplay
      const mockScript = "This is an AI-generated voice-over script based on your screenplay. It highlights the key narrative points and provides concise narration to complement the visuals.\n\nIn this video, we'll explore how our innovative product transforms the way you work.\n\nWith cutting-edge technology and intuitive design, complex tasks become simple.\n\nDiscover a new world of possibilities, where efficiency meets creativity.\n\nTake the first step toward the future of your business.";
      
      setAiScript(mockScript);
      setScriptText(mockScript);
      setIsLoadingAI(false);
      
      toast({
        title: 'Script Generated',
        description: 'AI-generated voice-over script is ready for customization.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };
  
  // Add new voice-over segment
  const addVoiceSegment = () => {
    if (!scriptText.trim()) {
      toast({
        title: 'Empty Script',
        description: 'Please enter text for the voice-over.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call to generate voice-over
    setTimeout(() => {
      const newSegment: VoiceOverSegment = {
        id: `segment-${Date.now()}`,
        text: scriptText,
        voice: selectedVoice,
        url: 'https://example.com/generated-voice.mp3', // Mock URL
        startTime: 0, // Will be adjusted in the mixer
        duration: calculateTextDuration(scriptText),
        isGenerated: true,
      };
      
      setVoiceSegments(prev => [...prev, newSegment]);
      setScriptText('');
      setIsGenerating(false);
      
      // Play the generated voice-over
      handlePlayPause(newSegment.url);
      
      toast({
        title: 'Voice-Over Generated',
        description: 'Voice-over segment has been generated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Notify parent component
      const updatedSegments = [...voiceSegments, newSegment].map(seg => ({
        id: seg.id,
        url: seg.url!,
        text: seg.text,
        startTime: seg.startTime,
        duration: seg.duration,
        voice: seg.voice,
      }));
      
      onVoiceOverGenerated(updatedSegments);
    }, 2000);
  };
  
  // Delete voice-over segment
  const deleteVoiceSegment = (id: string) => {
    setVoiceSegments(prev => prev.filter(seg => seg.id !== id));
    
    if (selectedSegment?.id === id) {
      setSelectedSegment(null);
    }
    
    // Stop playback if deleting currently playing segment
    if (selectedSegment?.id === id && isPlaying) {
      handleStop();
    }
    
    // Notify parent component
    const updatedSegments = voiceSegments
      .filter(seg => seg.id !== id)
      .map(seg => ({
        id: seg.id,
        url: seg.url!,
        text: seg.text,
        startTime: seg.startTime,
        duration: seg.duration,
        voice: seg.voice,
      }));
    
    onVoiceOverGenerated(updatedSegments);
    
    toast({
      title: 'Segment Deleted',
      description: 'Voice-over segment has been removed.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Edit voice-over segment
  const editVoiceSegment = (segment: VoiceOverSegment) => {
    setSelectedSegment(segment);
    setScriptText(segment.text);
    setSelectedVoice(segment.voice);
  };
  
  // Update voice-over segment
  const updateVoiceSegment = () => {
    if (!selectedSegment) return;
    
    setIsGenerating(true);
    
    // Simulate API call to update voice-over
    setTimeout(() => {
      const updatedSegment: VoiceOverSegment = {
        ...selectedSegment,
        text: scriptText,
        voice: selectedVoice,
        duration: calculateTextDuration(scriptText),
        isGenerated: true,
      };
      
      setVoiceSegments(prev => 
        prev.map(seg => seg.id === selectedSegment.id ? updatedSegment : seg)
      );
      
      setScriptText('');
      setSelectedSegment(null);
      setIsGenerating(false);
      
      // Notify parent component
      const updatedSegments = voiceSegments
        .map(seg => seg.id === selectedSegment.id ? updatedSegment : seg)
        .map(seg => ({
          id: seg.id,
          url: seg.url!,
          text: seg.text,
          startTime: seg.startTime,
          duration: seg.duration,
          voice: seg.voice,
        }));
      
      onVoiceOverGenerated(updatedSegments);
      
      toast({
        title: 'Segment Updated',
        description: 'Voice-over segment has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };
  
  // Calculate approximate duration based on text length
  const calculateTextDuration = (text: string): number => {
    // Average reading speed: ~150 words per minute or 2.5 words per second
    const wordCount = text.split(/\s+/).length;
    return Math.max(2, Math.ceil(wordCount / 2.5)); // Minimum 2 seconds
  };
  
  // Generate a title for a segment
  const getSegmentTitle = (segment: VoiceOverSegment): string => {
    const maxLength = 30;
    if (segment.text.length <= maxLength) {
      return segment.text;
    }
    return segment.text.substring(0, maxLength) + '...';
  };
  
  // Get the voice name from ID
  const getVoiceName = (voiceId: string): string => {
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    return voice ? voice.name : 'Unknown Voice';
  };
  
  return (
    <Stack spacing={6}>
      <VStack spacing={1} align="flex-start">
        <Heading size="md">Voice-Over Editor</Heading>
        <Text color="gray.400">
          Create narration for your video using AI-powered voice synthesis.
        </Text>
      </VStack>
      
      {/* Script Editor */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm">Script Editor</Heading>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="ai-script" mb="0" fontSize="sm">
              Use AI Script
            </FormLabel>
            <Switch 
              id="ai-script" 
              isChecked={useAIScript} 
              onChange={() => setUseAIScript(!useAIScript)}
              colorScheme="brand"
            />
          </FormControl>
        </Flex>
        
        <VStack spacing={4} align="stretch">
          <Textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder={useAIScript 
              ? "Loading AI script based on your screenplay..." 
              : "Enter your voice-over script here..."
            }
            minHeight="150px"
            bg="gray.600"
            isDisabled={isLoadingAI}
          />
          
          <Flex justifyContent="space-between" alignItems="center">
            <HStack spacing={4}>
              <Box>
                <Text mb={1} fontSize="sm">Voice</Text>
                <Select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  size="sm"
                  width="180px"
                  bg="gray.600"
                >
                  {VOICE_OPTIONS.map(voice => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} ({voice.gender}) {voice.isPremium ? '★' : ''}
                    </option>
                  ))}
                </Select>
              </Box>
              
              <IconButton
                icon={<FaVolumeUp />}
                aria-label="Preview voice"
                size="sm"
                onClick={() => {
                  const voice = VOICE_OPTIONS.find(v => v.id === selectedVoice);
                  if (voice?.preview) {
                    handlePlayPause(voice.preview);
                  }
                }}
              />
            </HStack>
            
            <HStack spacing={3}>
              {selectedSegment ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSegment(null);
                      setScriptText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="brand"
                    size="sm"
                    leftIcon={<FaEdit />}
                    onClick={updateVoiceSegment}
                    isLoading={isGenerating}
                    loadingText="Updating..."
                  >
                    Update Segment
                  </Button>
                </>
              ) : (
                <>
                  {useAIScript && !aiScript && (
                    <Button
                      leftIcon={<FaRobot />}
                      size="sm"
                      onClick={generateAIScript}
                      isLoading={isLoadingAI}
                      loadingText="Generating..."
                    >
                      Generate AI Script
                    </Button>
                  )}
                  <Button
                    colorScheme="brand"
                    size="sm"
                    leftIcon={<FaMicrophone />}
                    onClick={addVoiceSegment}
                    isLoading={isGenerating}
                    loadingText="Generating..."
                    isDisabled={!scriptText.trim()}
                  >
                    Generate Voice
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </VStack>
      </Box>
      
      {/* Voice-Over Segments */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm">Voice-Over Segments</Heading>
          <Text fontSize="sm" color="gray.400">
            {voiceSegments.length} segment{voiceSegments.length !== 1 ? 's' : ''}
          </Text>
        </Flex>
        
        {voiceSegments.length === 0 ? (
          <Box textAlign="center" py={8} bg="gray.800" borderRadius="md">
            <FaMicrophone size={24} style={{ margin: '0 auto 16px' }} />
            <Text color="gray.400">No voice-over segments yet</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Create your first voice-over segment using the script editor above.
            </Text>
          </Box>
        ) : (
          <Accordion allowMultiple defaultIndex={[0]}>
            {voiceSegments.map((segment, index) => (
              <AccordionItem 
                key={segment.id} 
                border="1px solid" 
                borderColor="gray.600"
                borderRadius="md"
                mb={3}
              >
                <h2>
                  <AccordionButton 
                    _expanded={{ bg: 'gray.600', color: 'white' }} 
                    borderRadius="md"
                  >
                    <Box flex="1" textAlign="left">
                      <HStack>
                        <Badge colorScheme="purple">{index + 1}</Badge>
                        <Text fontWeight="medium">{getSegmentTitle(segment)}</Text>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.800">
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" noOfLines={4}>
                      {segment.text}
                    </Text>
                    
                    <HStack justifyContent="space-between">
                      <HStack>
                        <IconButton
                          icon={isPlaying && currentAudioUrl === segment.url ? <FaPause /> : <FaPlay />}
                          aria-label={isPlaying && currentAudioUrl === segment.url ? "Pause" : "Play"}
                          size="sm"
                          colorScheme="brand"
                          onClick={() => handlePlayPause(segment.url)}
                        />
                        <Badge colorScheme="blue">
                          <HStack spacing={1}>
                            <FaUserAlt size={10} />
                            <Text>{getVoiceName(segment.voice)}</Text>
                          </HStack>
                        </Badge>
                        <Badge>
                          {segment.duration}s
                        </Badge>
                      </HStack>
                      
                      <HStack>
                        <IconButton
                          icon={<FaEdit />}
                          aria-label="Edit segment"
                          size="sm"
                          variant="ghost"
                          onClick={() => editVoiceSegment(segment)}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Delete segment"
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => deleteVoiceSegment(segment.id)}
                        />
                      </HStack>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {voiceSegments.length > 0 && (
          <Text fontSize="sm" mt={4} color="gray.400">
            These voice-over segments will be available in the Audio Mixer tab for timing adjustments.
          </Text>
        )}
      </Box>
      
      {/* Voice Options */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="sm">Voice Options</Heading>
          <Menu>
            <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm">
              Voice Samples
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              {VOICE_OPTIONS.map(voice => (
                <MenuItem 
                  key={voice.id}
                  onClick={() => {
                    if (voice.preview) {
                      handlePlayPause(voice.preview);
                    }
                  }}
                  bg="gray.800"
                  _hover={{ bg: 'gray.700' }}
                >
                  <HStack>
                    <Text>{voice.name}</Text>
                    <Badge colorScheme={voice.gender === 'male' ? 'blue' : voice.gender === 'female' ? 'pink' : 'purple'}>
                      {voice.gender}
                    </Badge>
                    {voice.isPremium && <Badge colorScheme="yellow">Premium</Badge>}
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {VOICE_OPTIONS.map(voice => (
            <Box 
              key={voice.id} 
              p={3} 
              bg="gray.800" 
              borderRadius="md"
              borderWidth="1px"
              borderColor={selectedVoice === voice.id ? 'brand.500' : 'transparent'}
              cursor="pointer"
              onClick={() => setSelectedVoice(voice.id)}
              _hover={{ borderColor: 'gray.600' }}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{voice.name}</Text>
                  <Text fontSize="xs" color="gray.400">
                    {voice.language} {voice.accent && `(${voice.accent})`}
                  </Text>
                </VStack>
                
                <HStack>
                  <Badge colorScheme={voice.gender === 'male' ? 'blue' : voice.gender === 'female' ? 'pink' : 'purple'}>
                    {voice.gender}
                  </Badge>
                  
                  {voice.isPremium && (
                    <Badge colorScheme="yellow">★</Badge>
                  )}
                </HStack>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Stack>
  );
};

// Helper component for the grid layout
const SimpleGrid: React.FC<{
  columns: { base: number; md: number; lg?: number };
  spacing: number;
  children: React.ReactNode;
}> = ({ columns, spacing, children }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        base: `repeat(${columns.base}, 1fr)`,
        md: `repeat(${columns.md}, 1fr)`,
        lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
      }}
      gridGap={spacing}
    >
      {children}
    </Box>
  );
};

export default VoiceOverEditor;