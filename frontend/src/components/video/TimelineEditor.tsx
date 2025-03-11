import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Text,
  Badge,
  Divider,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaArrowUp, 
  FaArrowDown, 
  FaTimes, 
  FaPlus, 
  FaCopy, 
  FaUndo, 
  FaLayerGroup, 
  FaClock
} from 'react-icons/fa';

// Type for a storyboard frame with timeline settings
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
  timelineSettings?: {
    startTime: number; // in seconds
    duration: number; // in seconds
    transitionType?: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom';
    transitionDuration?: number; // in seconds
  };
}

// Timeline track interface
interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'voice';
  items: TrackItem[];
}

// Timeline item interface
interface TrackItem {
  id: string;
  frameId?: string; // Reference to a storyboard frame (for video items)
  type: 'video' | 'audio' | 'voice';
  startTime: number;
  duration: number;
  src?: string;
  name?: string;
}

// Props for the TimelineEditor component
interface TimelineEditorProps {
  storyboard: StoryboardFrame[];
  onChange: (frames: StoryboardFrame[]) => void;
}

// Main TimelineEditor component
const TimelineEditor: React.FC<TimelineEditorProps> = ({ storyboard, onChange }) => {
  const [frames, setFrames] = useState<StoryboardFrame[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedItem, setSelectedItem] = useState<TrackItem | null>(null);
  const [zoom, setZoom] = useState(100); // percentage, 100% means normal zoom
  
  const toast = useToast();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Initialize frames and tracks when storyboard changes
  useEffect(() => {
    if (storyboard.length === 0) return;
    
    // Make sure all frames have timeline settings initialized
    const initializedFrames = storyboard.map((frame, index) => ({
      ...frame,
      timelineSettings: frame.timelineSettings || {
        startTime: index * 3, // stagger frames by 3 seconds
        duration: frame.cameraSettings?.duration || 3,
        transitionType: 'fade',
        transitionDuration: 0.5
      }
    }));
    
    setFrames(initializedFrames);
    
    // Initialize video track with items for each frame
    const videoItems: TrackItem[] = initializedFrames.map(frame => ({
      id: `video-${frame.id}`,
      frameId: frame.id,
      type: 'video',
      startTime: frame.timelineSettings!.startTime,
      duration: frame.timelineSettings!.duration,
      name: `Frame ${frame.order}`
    }));
    
    // Calculate total duration
    const lastFrame = initializedFrames[initializedFrames.length - 1];
    const calculatedDuration = lastFrame.timelineSettings!.startTime + lastFrame.timelineSettings!.duration;
    setTotalDuration(calculatedDuration);
    
    // Set up tracks
    setTracks([
      {
        id: 'video-track',
        name: 'Video',
        type: 'video',
        items: videoItems
      },
      {
        id: 'audio-track',
        name: 'Music',
        type: 'audio',
        items: []
      },
      {
        id: 'voice-track',
        name: 'Voice Over',
        type: 'voice',
        items: []
      }
    ]);
  }, [storyboard]);
  
  // Play/pause timeline
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Step forward/backward
  const stepForward = () => {
    const nextFrameStartTime = frames.find(frame => 
      frame.timelineSettings && frame.timelineSettings.startTime > currentTime
    )?.timelineSettings?.startTime;
    
    if (nextFrameStartTime !== undefined) {
      setCurrentTime(nextFrameStartTime);
    }
  };
  
  const stepBackward = () => {
    const previousFrames = frames.filter(frame => 
      frame.timelineSettings && frame.timelineSettings.startTime < currentTime
    );
    
    if (previousFrames.length > 0) {
      const lastPrevFrame = previousFrames[previousFrames.length - 1];
      setCurrentTime(lastPrevFrame.timelineSettings!.startTime);
    } else {
      setCurrentTime(0);
    }
  };
  
  // Handle timeline scrubbing
  const handleTimelineChange = (value: number) => {
    setCurrentTime(value);
  };
  
  // Update frame duration
  const updateFrameDuration = (frameId: string, newDuration: number) => {
    // Find the frame
    const frameIndex = frames.findIndex(f => f.id === frameId);
    if (frameIndex === -1) return;
    
    // Create updated frames array
    const updatedFrames = [...frames];
    updatedFrames[frameIndex] = {
      ...updatedFrames[frameIndex],
      timelineSettings: {
        ...updatedFrames[frameIndex].timelineSettings!,
        duration: newDuration
      }
    };
    
    // Recalculate start times for subsequent frames
    for (let i = frameIndex + 1; i < updatedFrames.length; i++) {
      const prevFrame = updatedFrames[i - 1];
      const prevEndTime = prevFrame.timelineSettings!.startTime + prevFrame.timelineSettings!.duration;
      
      updatedFrames[i] = {
        ...updatedFrames[i],
        timelineSettings: {
          ...updatedFrames[i].timelineSettings!,
          startTime: prevEndTime
        }
      };
    }
    
    // Update total duration
    const lastFrame = updatedFrames[updatedFrames.length - 1];
    const calculatedDuration = lastFrame.timelineSettings!.startTime + lastFrame.timelineSettings!.duration;
    setTotalDuration(calculatedDuration);
    
    // Update frames state
    setFrames(updatedFrames);
    
    // Update tracks state
    const updatedTracks = [...tracks];
    const videoTrackIndex = updatedTracks.findIndex(t => t.id === 'video-track');
    
    if (videoTrackIndex !== -1) {
      const updatedItems = updatedFrames.map(frame => ({
        id: `video-${frame.id}`,
        frameId: frame.id,
        type: 'video' as const,
        startTime: frame.timelineSettings!.startTime,
        duration: frame.timelineSettings!.duration,
        name: `Frame ${frame.order}`
      }));
      
      updatedTracks[videoTrackIndex] = {
        ...updatedTracks[videoTrackIndex],
        items: updatedItems
      };
      
      setTracks(updatedTracks);
    }
    
    // Notify parent component
    onChange(updatedFrames);
  };
  
  // Get the current frame based on the timeline position
  const getCurrentFrame = () => {
    for (const frame of frames) {
      const { startTime, duration } = frame.timelineSettings || { startTime: 0, duration: 0 };
      if (currentTime >= startTime && currentTime < startTime + duration) {
        return frame;
      }
    }
    return frames[0]; // Default to first frame if none found
  };
  
  // Format time (seconds) to MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Render timeline tracks
  const renderTracks = () => {
    const pixelsPerSecond = (timelineRef.current?.clientWidth ?? 1000) / totalDuration * (zoom / 100);
    
    return tracks.map(track => (
      <Box key={track.id} mb={4}>
        <Flex alignItems="center" mb={2}>
          <Box 
            width="100px" 
            bg="gray.700" 
            p={2} 
            borderRadius="md" 
            mr={2}
            textAlign="center"
          >
            <Text fontWeight="bold">{track.name}</Text>
          </Box>
          
          <Box 
            flex="1" 
            position="relative" 
            height="60px" 
            bg="gray.700" 
            borderRadius="md"
            overflow="hidden"
          >
            {/* Track items */}
            {track.items.map(item => (
              <Box
                key={item.id}
                position="absolute"
                left={`${item.startTime * pixelsPerSecond}px`}
                width={`${item.duration * pixelsPerSecond}px`}
                height="60px"
                bg={track.type === 'video' ? 'brand.500' : track.type === 'audio' ? 'green.500' : 'purple.500'}
                opacity={selectedItem?.id === item.id ? 1 : 0.8}
                borderRadius="md"
                border="2px solid"
                borderColor={selectedItem?.id === item.id ? 'white' : 'transparent'}
                cursor="pointer"
                onClick={() => setSelectedItem(item)}
                _hover={{ opacity: 0.9 }}
              >
                <Flex 
                  height="100%" 
                  alignItems="center" 
                  justifyContent="center"
                  px={2}
                >
                  <Text 
                    fontSize="sm" 
                    fontWeight="bold" 
                    color="white"
                    noOfLines={1}
                  >
                    {item.name}
                  </Text>
                </Flex>
              </Box>
            ))}
            
            {/* Current time indicator */}
            <Box
              position="absolute"
              left={`${currentTime * pixelsPerSecond}px`}
              top="0"
              height="100%"
              width="2px"
              bg="red.500"
              zIndex="10"
            />
          </Box>
        </Flex>
      </Box>
    ));
  };
  
  // Add a new empty audio track item
  const addAudioTrackItem = () => {
    toast({
      title: "Not implemented",
      description: "Adding audio tracks will be implemented in the Audio module",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Timeline Editor</Heading>
      <Text mb={6} color="gray.400">
        Arrange the sequence and timing of your video clips, add music, and voice-over.
      </Text>
      
      {frames.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.700" borderRadius="md">
          <Text color="gray.400" mb={4}>No storyboard frames available</Text>
          <Text fontSize="sm" color="gray.500">
            Please create a storyboard in the previous step before editing the timeline.
          </Text>
        </Box>
      ) : (
        <Stack spacing={6}>
          {/* Preview area */}
          <Flex 
            justifyContent="center" 
            alignItems="center" 
            bg="gray.900"
            borderRadius="md"
            p={4}
            minHeight="300px"
          >
            <Box maxWidth="70%" maxHeight="280px">
              <Image
                src={getCurrentFrame()?.imageUrl}
                fallbackSrc="https://via.placeholder.com/800x450?text=Frame+Preview"
                alt="Current frame"
                maxHeight="280px"
                objectFit="contain"
                mx="auto"
              />
            </Box>
          </Flex>
          
          {/* Playback controls */}
          <Box>
            <Flex justifyContent="center" alignItems="center" mb={4}>
              <IconButton
                icon={<FaStepBackward />}
                aria-label="Previous frame"
                onClick={stepBackward}
                mr={2}
              />
              <IconButton
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlayPause}
                colorScheme="brand"
                mr={2}
              />
              <IconButton
                icon={<FaStepForward />}
                aria-label="Next frame"
                onClick={stepForward}
                mr={4}
              />
              
              <Box flex="1" maxWidth="500px">
                <Slider
                  min={0}
                  max={totalDuration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleTimelineChange}
                  colorScheme="brand"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>
              </Box>
              
              <Text ml={4} width="60px" textAlign="right">
                {formatTime(currentTime)}
              </Text>
              <Text color="gray.500" mx={1}>/</Text>
              <Text width="60px" color="gray.500">
                {formatTime(totalDuration)}
              </Text>
            </Flex>
            
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <HStack>
                <Tooltip label="Add music track">
                  <IconButton
                    icon={<FaPlus />}
                    aria-label="Add music track"
                    size="sm"
                    onClick={addAudioTrackItem}
                  />
                </Tooltip>
                
                <Tooltip label="Zoom in/out">
                  <HStack>
                    <Text fontSize="sm" color="gray.400">Zoom:</Text>
                    <Slider
                      min={50}
                      max={200}
                      step={10}
                      value={zoom}
                      onChange={setZoom}
                      colorScheme="gray"
                      width="100px"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={3} />
                    </Slider>
                  </HStack>
                </Tooltip>
              </HStack>
              
              <HStack>
                <Text fontSize="sm" color="gray.400">Current Frame:</Text>
                <Badge colorScheme="blue" borderRadius="full" px={2}>
                  {getCurrentFrame()?.order || 1}
                </Badge>
              </HStack>
            </Flex>
          </Box>
          
          {/* Timeline area */}
          <Box ref={timelineRef} overflowX="auto">
            {renderTracks()}
          </Box>
          
          {/* Selected item properties */}
          {selectedItem && selectedItem.frameId && (
            <Box bg="gray.700" p={4} borderRadius="md">
              <Flex alignItems="center" mb={4}>
                <Heading size="sm" flex="1">Frame Properties</Heading>
                <IconButton
                  icon={<FaTimes />}
                  aria-label="Close properties"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedItem(null)}
                />
              </Flex>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text mb={1} fontSize="sm">Frame Duration</Text>
                  <HStack>
                    <Box flex="1">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={selectedItem.duration}
                        onChange={(val) => {
                          updateFrameDuration(selectedItem.frameId!, val);
                        }}
                        colorScheme="brand"
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb boxSize={4} />
                      </Slider>
                    </Box>
                    <Text width="40px" textAlign="right">{selectedItem.duration}s</Text>
                  </HStack>
                </Box>
                
                <Box>
                  <Text mb={1} fontSize="sm">Timeline Position</Text>
                  <HStack>
                    <Text>{formatTime(selectedItem.startTime)}</Text>
                    <Text color="gray.500">-</Text>
                    <Text>{formatTime(selectedItem.startTime + selectedItem.duration)}</Text>
                  </HStack>
                </Box>
              </SimpleGrid>
              
              <Divider my={4} borderColor="gray.600" />
              
              <VStack alignItems="flex-start" spacing={2}>
                <Text fontSize="sm" color="gray.400">
                  Tip: Adjust the duration slider to change how long this frame appears in the video.
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Note: Changing a frame's duration will adjust the timing of all subsequent frames.
                </Text>
              </VStack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default TimelineEditor;