import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Text,
  HStack,
  VStack,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  useToast,
  Select,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpandAlt, 
  FaCompress, 
  FaCog, 
  FaDownload, 
  FaShare, 
  FaChevronDown, 
  FaCheckCircle,
  FaRandom,
  FaFileExport,
  FaShareAlt
} from 'react-icons/fa';
import ExportDialog from '../export/ExportDialog';

// Props for the VideoPreview component
interface VideoPreviewProps {
  videoUrl: string;
  onExport?: (options: ExportOptions) => void;
  projectId?: string;
}

// Export options interface
interface ExportOptions {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  resolution: '480p' | '720p' | '1080p';
  includeAudio: boolean;
}

// Main VideoPreview component
const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onExport, projectId = 'default-project' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  // Export dialog state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    // Set initial volume
    video.volume = volume;
    
    // Clean up event listeners
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, volume]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle timeline scrubbing
  const handleTimelineChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value;
    setCurrentTime(value);
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = value;
    setVolume(value);
    
    if (value === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  // Format time to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Open export dialog
  const handleOpenExportDialog = () => {
    onOpen();
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Video Preview</Heading>
      <Text mb={6} color="gray.400">
        Preview your generated video and export it in your preferred format.
      </Text>
      
      {/* Video player */}
      <Box 
        ref={containerRef}
        bg="black" 
        borderRadius="md" 
        overflow="hidden"
        position="relative"
        mb={6}
      >
        <Box 
          as="video"
          ref={videoRef}
          src={videoUrl}
          width="100%"
          height="auto"
          maxHeight="500px"
          objectFit="contain"
          onClick={togglePlayPause}
          sx={{ aspectRatio: '16/9' }}
        />
        
        {/* Video controls overlay */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0, 0, 0, 0.7)"
          p={3}
          alignItems="center"
          opacity={1}
          transition="opacity 0.3s"
          _hover={{ opacity: 1 }}
        >
          {/* Play/Pause button */}
          <IconButton
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            aria-label={isPlaying ? "Pause" : "Play"}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={togglePlayPause}
            mr={2}
          />
          
          {/* Current time / Duration */}
          <Text color="white" fontSize="sm" mr={2}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          
          {/* Progress slider */}
          <Box flex="1" mx={2}>
            <Slider
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleTimelineChange}
              colorScheme="brand"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>
          </Box>
          
          {/* Volume control */}
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                aria-label="Volume"
                variant="ghost"
                colorScheme="whiteAlpha"
                mr={2}
                onClick={toggleMute}
              />
            </PopoverTrigger>
            <PopoverContent bg="gray.800" borderColor="gray.700" width="200px">
              <PopoverArrow bg="gray.800" />
              <PopoverCloseButton />
              <PopoverHeader border="0" fontWeight="medium">Volume</PopoverHeader>
              <PopoverBody px={4} py={3}>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  colorScheme="brand"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={3} />
                </Slider>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          {/* Fullscreen button */}
          <IconButton
            icon={isFullscreen ? <FaCompress /> : <FaExpandAlt />}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={toggleFullscreen}
          />
        </Flex>
      </Box>
      
      {/* Export and share actions */}
      <Box bg="gray.700" p={6} borderRadius="md">
        <HStack spacing={8} justifyContent="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="sm">Ready to Share</Heading>
            <Text fontSize="sm" color="gray.400">
              Your video is ready to be exported and shared.
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FaFileExport />}
              colorScheme="brand"
              onClick={handleOpenExportDialog}
            >
              Export & Share
            </Button>
            
            <Menu>
              <MenuButton as={Button} rightIcon={<FaChevronDown />} variant="outline">
                Quick Share
              </MenuButton>
              <MenuList bg="gray.800" borderColor="gray.700">
                <MenuItem icon={<FaShare />} onClick={handleOpenExportDialog} bg="gray.800" _hover={{ bg: "gray.700" }}>
                  Advanced Export Options
                </MenuItem>
                <MenuItem icon={<FaDownload />} as="a" href={videoUrl} download bg="gray.800" _hover={{ bg: "gray.700" }}>
                  Download MP4
                </MenuItem>
                <MenuItem icon={<FaShareAlt />} onClick={() => {
                  // Open export dialog with direct link tab active
                  onOpen();
                  // We would set active tab to sharing here
                }} bg="gray.800" _hover={{ bg: "gray.700" }}>
                  Share Link
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
      </Box>
      
      {/* Export dialog */}
      <ExportDialog 
        isOpen={isOpen} 
        onClose={onClose} 
        projectId={projectId}
        videoUrl={videoUrl}
      />
    </Box>
  );
};

// Grid component since it's not imported from Chakra UI
const Grid: React.FC<{
  templateColumns: { base: string; md: string };
  gap: number;
  children: React.ReactNode;
}> = ({ templateColumns, gap, children }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: templateColumns.base, md: templateColumns.md }}
      gridGap={gap}
    >
      {children}
    </Box>
  );
};

export default VideoPreview;
