import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  VStack,
  HStack,
  IconButton,
  Grid,
  GridItem,
  Badge,
  useToast,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Switch,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaMusic, 
  FaMicrophone, 
  FaTrash, 
  FaSave,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaWaveSquare,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { AudioData } from './AudioTab';

// Type definitions
interface AudioMixerProps {
  audioData: AudioData;
  videoUrl?: string;
  onMixCompleted: (audioData: AudioData) => void;
}

interface AudioTrack {
  id: string;
  type: 'music' | 'voiceover' | 'effect';
  name: string;
  url: string;
  volume: number;
  isMuted: boolean;
  startTime: number;
  duration: number;
  waveformData?: number[]; // For visualization
  audioNode?: HTMLAudioElement;
  gainNode?: GainNode;
}

const AudioMixer: React.FC<AudioMixerProps> = ({ audioData, videoUrl, onMixCompleted }) => {
  // State for managing audio tracks
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [masterVolume, setMasterVolume] = useState(100);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // References
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const toast = useToast();
  const dispatch = useAppDispatch();
  
  // Initialize audio context and set up tracks
  useEffect(() => {
    // Create AudioContext if not exists
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Parse audio data and create tracks
    const newTracks: AudioTrack[] = [];
    
    // Add music track if exists
    if (audioData.musicTrack) {
      newTracks.push({
        id: `music-${Date.now()}`,
        type: 'music',
        name: audioData.musicTrack.name || 'Background Music',
        url: audioData.musicTrack.url,
        volume: 80, // Default to 80%
        isMuted: false,
        startTime: 0,
        duration: audioData.musicTrack.duration || 0,
        waveformData: generateMockWaveform(50), // Generate mock waveform data
      });
    }
    
    // Add voiceover tracks if exist
    if (audioData.voiceoverTracks?.length) {
      audioData.voiceoverTracks.forEach(vo => {
        newTracks.push({
          id: vo.id || `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'voiceover',
          name: `Voice: ${vo.text.substring(0, 20)}${vo.text.length > 20 ? '...' : ''}`,
          url: vo.url,
          volume: 100, // Default to 100%
          isMuted: false,
          startTime: vo.startTime || 0,
          duration: vo.duration || 0,
          waveformData: generateMockWaveform(50), // Generate mock waveform data
        });
      });
    }
    
    // Add sound effects if exist
    if (audioData.soundEffects?.length) {
      audioData.soundEffects.forEach(sfx => {
        newTracks.push({
          id: sfx.id || `sfx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'effect',
          name: sfx.name || 'Sound Effect',
          url: sfx.url,
          volume: 90, // Default to 90%
          isMuted: false,
          startTime: sfx.startTime || 0,
          duration: sfx.duration || 0,
          waveformData: generateMockWaveform(30), // Generate mock waveform data
        });
      });
    }
    
    setTracks(newTracks);
    
    // Calculate total duration based on the longest track
    if (newTracks.length > 0) {
      const maxDuration = Math.max(
        ...newTracks.map(track => track.startTime + track.duration)
      );
      setDuration(maxDuration);
    }
    
    // Clean up function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose audio elements
      tracks.forEach(track => {
        if (track.audioNode) {
          track.audioNode.pause();
          track.audioNode.src = '';
        }
      });
    };
  }, [audioData]);
  
  // Load audio elements for each track
  useEffect(() => {
    const loadAudioElements = async () => {
      const updatedTracks = [...tracks];
      
      for (let i = 0; i < updatedTracks.length; i++) {
        const track = updatedTracks[i];
        
        // Create audio element if not exists
        if (!track.audioNode) {
          const audio = new Audio(track.url);
          audio.crossOrigin = 'anonymous';
          audio.preload = 'auto';
          
          // Wait for metadata to load
          await new Promise(resolve => {
            audio.addEventListener('loadedmetadata', resolve, { once: true });
            audio.addEventListener('error', resolve, { once: true });
          });
          
          // Create gain node for volume control
          if (audioContextRef.current) {
            const source = audioContextRef.current.createMediaElementSource(audio);
            const gainNode = audioContextRef.current.createGain();
            
            // Connect the nodes
            source.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            // Update gain value based on track volume
            gainNode.gain.value = track.volume / 100;
            
            // Update track with audio node and gain node
            updatedTracks[i] = {
              ...track,
              audioNode: audio,
              gainNode: gainNode,
              duration: audio.duration || track.duration,
            };
          }
        }
      }
      
      setTracks(updatedTracks);
    };
    
    if (tracks.length > 0) {
      loadAudioElements();
    }
  }, [tracks]);
  
  // Handle play/pause
  const togglePlayback = () => {
    if (!isPlaying) {
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // Play all tracks
      tracks.forEach(track => {
        if (track.audioNode) {
          track.audioNode.currentTime = currentTime;
          if (!track.isMuted) {
            track.audioNode.play().catch(e => console.error('Error playing audio:', e));
          }
        }
      });
      
      // Start animation frame for time updates
      const updateTime = () => {
        setCurrentTime(prev => {
          const newTime = prev + 0.016; // ~60fps
          
          // Check if we've reached the end
          if (newTime >= duration) {
            stopPlayback();
            return 0;
          }
          
          animationFrameRef.current = requestAnimationFrame(updateTime);
          return newTime;
        });
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTime);
      setIsPlaying(true);
    } else {
      // Pause all tracks
      tracks.forEach(track => {
        if (track.audioNode) {
          track.audioNode.pause();
        }
      });
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      setIsPlaying(false);
    }
  };
  
  // Stop playback
  const stopPlayback = () => {
    // Stop all tracks
    tracks.forEach(track => {
      if (track.audioNode) {
        track.audioNode.pause();
        track.audioNode.currentTime = 0;
      }
    });
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  // Seek to specific time
  const seekTo = (time: number) => {
    // Ensure time is within bounds
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    // Update all audio elements
    tracks.forEach(track => {
      if (track.audioNode) {
        track.audioNode.currentTime = clampedTime;
      }
    });
    
    setCurrentTime(clampedTime);
  };
  
  // Handle track volume change
  const handleVolumeChange = (trackId: string, volume: number) => {
    setTracks(prev => 
      prev.map(track => {
        if (track.id === trackId) {
          // Update gain node if exists
          if (track.gainNode) {
            track.gainNode.gain.value = (volume / 100) * (masterVolume / 100);
          }
          
          return {
            ...track,
            volume,
            isMuted: volume === 0
          };
        }
        return track;
      })
    );
  };
  
  // Handle track mute toggle
  const toggleMute = (trackId: string) => {
    setTracks(prev => 
      prev.map(track => {
        if (track.id === trackId) {
          const newMuteState = !track.isMuted;
          
          // Update gain node if exists
          if (track.gainNode) {
            track.gainNode.gain.value = newMuteState ? 0 : (track.volume / 100) * (masterVolume / 100);
          }
          
          // Also pause/play audio element if we're currently playing
          if (track.audioNode && isPlaying) {
            if (newMuteState) {
              track.audioNode.pause();
            } else {
              track.audioNode.currentTime = currentTime;
              track.audioNode.play().catch(e => console.error('Error playing audio:', e));
            }
          }
          
          return {
            ...track,
            isMuted: newMuteState
          };
        }
        return track;
      })
    );
  };
  
  // Handle master volume change
  const handleMasterVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    
    // Update all gain nodes
    tracks.forEach(track => {
      if (track.gainNode && !track.isMuted) {
        track.gainNode.gain.value = (track.volume / 100) * (volume / 100);
      }
    });
    
    setIsMasterMuted(volume === 0);
  };
  
  // Toggle master mute
  const toggleMasterMute = () => {
    const newMuteState = !isMasterMuted;
    setIsMasterMuted(newMuteState);
    
    // Update all gain nodes
    tracks.forEach(track => {
      if (track.gainNode) {
        track.gainNode.gain.value = newMuteState ? 0 : (track.volume / 100) * (masterVolume / 100);
      }
    });
    
    // Also pause/play audio elements if we're currently playing
    if (isPlaying) {
      tracks.forEach(track => {
        if (track.audioNode) {
          if (newMuteState) {
            track.audioNode.pause();
          } else if (!track.isMuted) {
            track.audioNode.currentTime = currentTime;
            track.audioNode.play().catch(e => console.error('Error playing audio:', e));
          }
        }
      });
    }
  };
  
  // Complete the mix
  const handleCompleteMix = () => {
    setIsProcessing(true);
    
    // In a real application, we would merge the audio tracks here
    // For now, we'll just simulate a processing delay
    setTimeout(() => {
      // Convert tracks to the format expected by the parent component
      const mixedAudio: AudioData = {
        musicTrack: tracks.find(t => t.type === 'music') ? {
          url: tracks.find(t => t.type === 'music')!.url,
          name: tracks.find(t => t.type === 'music')!.name,
          duration: tracks.find(t => t.type === 'music')!.duration
        } : undefined,
        
        voiceoverTracks: tracks
          .filter(t => t.type === 'voiceover')
          .map(t => ({
            id: t.id,
            url: t.url,
            text: t.name.replace('Voice: ', ''),
            startTime: t.startTime,
            duration: t.duration,
            voice: 'default' // Placeholder
          })),
        
        soundEffects: tracks
          .filter(t => t.type === 'effect')
          .map(t => ({
            id: t.id,
            url: t.url,
            name: t.name,
            startTime: t.startTime,
            duration: t.duration
          }))
      };
      
      // Call the callback function
      onMixCompleted(mixedAudio);
      
      setIsProcessing(false);
      
      toast({
        title: 'Mix Completed',
        description: 'Your audio mix has been processed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };
  
  // Helper to format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate mock waveform data for visualization
  function generateMockWaveform(length: number): number[] {
    const waveform = [];
    for (let i = 0; i < length; i++) {
      // More variation for music, less for voice
      const randomFactor = Math.random() * 0.5 + 0.3;
      waveform.push(randomFactor);
    }
    return waveform;
  }
  
  // Render track waveform
  const renderWaveform = (track: AudioTrack) => {
    if (!track.waveformData || track.waveformData.length === 0) {
      return null;
    }
    
    return (
      <Flex h="40px" align="center" w="100%">
        {track.waveformData.map((value, index) => (
          <Box
            key={`${track.id}-wave-${index}`}
            as={motion.div}
            h={`${value * 40}px`}
            w="6px"
            mx="1px"
            bg={track.type === 'music' ? 'blue.400' : track.type === 'voiceover' ? 'green.400' : 'purple.400'}
            opacity={track.isMuted ? 0.3 : 0.8}
            initial={{ height: 0 }}
            animate={{ height: `${value * 40}px` }}
            transition={{ duration: 0.3 }}
            borderRadius="1px"
          />
        ))}
      </Flex>
    );
  };
  
  // No tracks message
  if (tracks.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" mb={4}>
          No audio tracks available for mixing. Please generate background music and/or voice-over first.
        </Text>
        <Button 
          leftIcon={<FaMusic />} 
          colorScheme="brand"
          onClick={() => {
            // Navigate to music tab
            const musicTabButton = document.querySelector('[aria-controls="tabs-\\:r1\\:--tabpanel-0"]') as HTMLElement;
            if (musicTabButton) {
              musicTabButton.click();
            }
          }}
        >
          Generate Background Music
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Stack spacing={6}>
        <Heading size="md" mb={2}>Audio Mixer</Heading>
        <Text mb={4}>
          Adjust the volume levels and timing of your audio tracks to create the perfect mix.
        </Text>
        
        {/* Transport controls */}
        <Flex alignItems="center" mb={4}>
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            colorScheme="brand"
            size="md"
            mr={2}
            onClick={togglePlayback}
          />
          <IconButton
            aria-label="Stop"
            icon={<FaStop />}
            colorScheme="gray"
            size="md"
            mr={4}
            onClick={stopPlayback}
          />
          
          <Text fontSize="sm" width="60px">{formatTime(currentTime)}</Text>
          
          <Slider
            aria-label="timeline-slider"
            min={0}
            max={duration}
            step={0.01}
            value={currentTime}
            onChange={seekTo}
            flex={1}
            colorScheme="brand"
            mx={4}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={4} />
          </Slider>
          
          <Text fontSize="sm" width="60px">{formatTime(duration)}</Text>
        </Flex>
        
        {/* Master volume */}
        <Flex 
          alignItems="center" 
          bg="gray.700" 
          p={4} 
          borderRadius="md" 
          mb={4}
        >
          <Text fontWeight="bold" mr={4}>Master</Text>
          
          <IconButton
            aria-label={isMasterMuted ? 'Unmute' : 'Mute'}
            icon={isMasterMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            colorScheme={isMasterMuted ? 'red' : 'gray'}
            size="sm"
            mr={4}
            onClick={toggleMasterMute}
          />
          
          <Slider
            aria-label="master-volume-slider"
            min={0}
            max={100}
            value={masterVolume}
            onChange={handleMasterVolumeChange}
            flex={1}
            colorScheme="blue"
            onMouseEnter={() => setShowVolumeTooltip(true)}
            onMouseLeave={() => setShowVolumeTooltip(false)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="blue.500"
              color="white"
              placement="top"
              isOpen={showVolumeTooltip}
              label={`${masterVolume}%`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
          
          <Text ml={4} w="40px" textAlign="right">{masterVolume}%</Text>
        </Flex>
        
        {/* Audio tracks */}
        <Box maxH="400px" overflowY="auto" borderRadius="md">
          <Stack spacing={4}>
            {tracks.map(track => (
              <Flex
                key={track.id}
                p={4}
                bg={track.type === 'music' ? 'blue.900' : track.type === 'voiceover' ? 'green.900' : 'purple.900'}
                borderRadius="md"
                alignItems="center"
                opacity={track.isMuted ? 0.6 : 1}
                _hover={{ boxShadow: 'md' }}
                onClick={() => setSelectedTrack(track.id)}
                cursor="pointer"
                position="relative"
                border={selectedTrack === track.id ? '2px solid' : '2px solid transparent'}
                borderColor={selectedTrack === track.id ? 
                  (track.type === 'music' ? 'blue.400' : track.type === 'voiceover' ? 'green.400' : 'purple.400') 
                  : 'transparent'}
              >
                <Box position="relative" w="40px" h="40px" mr={4} borderRadius="md" overflow="hidden" flexShrink={0}>
                  {track.type === 'music' ? (
                    <Box bg="blue.400" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                      <FaMusic size="20px" color="white" />
                    </Box>
                  ) : track.type === 'voiceover' ? (
                    <Box bg="green.400" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                      <FaMicrophone size="20px" color="white" />
                    </Box>
                  ) : (
                    <Box bg="purple.400" w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                      <FaWaveSquare size="20px" color="white" />
                    </Box>
                  )}
                </Box>
                
                <VStack align="start" flex={1} spacing={1}>
                  <Flex w="100%" justify="space-between" align="center">
                    <Text fontWeight="bold" fontSize="sm">{track.name}</Text>
                    <Badge colorScheme={track.type === 'music' ? 'blue' : track.type === 'voiceover' ? 'green' : 'purple'}>
                      {track.type}
                    </Badge>
                  </Flex>
                  
                  {renderWaveform(track)}
                </VStack>
                
                <HStack ml={4} spacing={4}>
                  <IconButton
                    aria-label={track.isMuted ? 'Unmute' : 'Mute'}
                    icon={track.isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    colorScheme={track.isMuted ? 'red' : 'gray'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(track.id);
                    }}
                  />
                  
                  <Slider
                    aria-label={`${track.id}-volume-slider`}
                    min={0}
                    max={100}
                    width="100px"
                    value={track.volume}
                    onChange={(val) => handleVolumeChange(track.id, val)}
                    colorScheme={track.type === 'music' ? 'blue' : track.type === 'voiceover' ? 'green' : 'purple'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  
                  <Text w="40px" textAlign="right" fontSize="sm">{track.volume}%</Text>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Box>
        
        {/* Advanced controls - could be expanded in future */}
        <Card bg="gray.700" borderRadius="md">
          <CardHeader pb={2}>
            <Heading size="sm">Track Balance</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="sm" mb={4}>
              Adjust the relative balance between different types of audio tracks.
            </Text>
            
            <Grid templateColumns="repeat(12, 1fr)" gap={4}>
              <GridItem colSpan={4}>
                <Text textAlign="center" fontSize="sm" mb={2}>Music</Text>
                <Slider
                  aria-label="music-balance"
                  defaultValue={50}
                  colorScheme="blue"
                  onChange={(val) => {
                    // Apply to all music tracks
                    tracks
                      .filter(t => t.type === 'music')
                      .forEach(t => handleVolumeChange(t.id, val));
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </GridItem>
              
              <GridItem colSpan={4}>
                <Text textAlign="center" fontSize="sm" mb={2}>Voice</Text>
                <Slider
                  aria-label="voice-balance"
                  defaultValue={80}
                  colorScheme="green"
                  onChange={(val) => {
                    // Apply to all voiceover tracks
                    tracks
                      .filter(t => t.type === 'voiceover')
                      .forEach(t => handleVolumeChange(t.id, val));
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </GridItem>
              
              <GridItem colSpan={4}>
                <Text textAlign="center" fontSize="sm" mb={2}>Effects</Text>
                <Slider
                  aria-label="effects-balance"
                  defaultValue={60}
                  colorScheme="purple"
                  onChange={(val) => {
                    // Apply to all effect tracks
                    tracks
                      .filter(t => t.type === 'effect')
                      .forEach(t => handleVolumeChange(t.id, val));
                  }}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        
        {/* Action buttons */}
        <Flex justifyContent="flex-end" mt={4}>
          <Button
            leftIcon={<FaSave />}
            colorScheme="brand"
            onClick={handleCompleteMix}
            isLoading={isProcessing}
            loadingText="Processing"
          >
            Complete Mix
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default AudioMixer;
